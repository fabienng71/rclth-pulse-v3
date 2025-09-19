
import { supabase } from '../lib/supabase';
import { readExcelFile, transformExcelData, SALES_HEADER_MAPPING, CREDIT_MEMO_HEADER_MAPPING, COGS_HEADER_MAPPING } from '../utils/excel';
import { toast } from 'sonner';

interface UploadProgressCallback {
  (progress: { current: number, total: number }): void;
}

// Optimized batch configuration - these are defaults that can be overridden
const BATCH_CONFIG = {
  sales: {
    batchSize: 25,  // Default batch size, can be overridden
    delayMs: 300    // Delay between batches
  },
  creditMemo: {
    batchSize: 30,  // Default batch size, can be overridden
    delayMs: 250
  },
  cogs: {
    batchSize: 25,  // Default batch size, can be overridden
    delayMs: 300
  }
};

// Helper function to add delay between batches
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced logging function for sync operations
async function logSyncOperation(
  syncType: string,
  status: 'success' | 'partial' | 'failed',
  recordsProcessed: number,
  recordsInserted: number,
  recordsUpdated: number = 0,
  errors: any[] = [],
  syncDurationMs: number,
  syncedBy?: string,
  batchSize?: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Include batch size in the logged data
    const logData = {
      sync_type: syncType,
      status,
      records_processed: recordsProcessed,
      records_updated: recordsUpdated,
      records_inserted: recordsInserted,
      errors: errors.length > 0 ? errors : null,
      sync_duration_ms: syncDurationMs,
      synced_by: user?.id || null
    };

    // Add batch size to the first error entry if it exists, or create a new entry
    if (batchSize) {
      if (errors.length > 0) {
        errors[0].batch_size_used = batchSize;
      } else {
        logData.errors = [{ batch_size_used: batchSize }];
      }
    }
    
    const { error } = await supabase
      .from('sync_log')
      .insert(logData);
    
    if (error) {
      console.error('Failed to log sync operation:', error);
    } else {
      console.log(`Sync operation logged: ${syncType} - ${status} (batch size: ${batchSize || 'default'})`);
    }
  } catch (error) {
    console.error('Error logging sync operation:', error);
  }
}

// Enhanced retry logic with transaction safety and insertion verification
async function retryBatch(batchData: any[], tableName: 'salesdata' | 'credit_memos', maxRetries: number = 3): Promise<{ success: boolean; error?: any; actualInserted?: number }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Inserting ${batchData.length} records into ${tableName}`);
      console.log(`Sample record being inserted:`, JSON.stringify(batchData[0], null, 2));
      
      // Get initial count before insertion
      const { count: beforeCount } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      console.log(`Before insertion: ${tableName} has ${beforeCount} records`);
      
      // Perform the insertion with debugging
      console.log(`Executing insert operation on ${tableName}...`);
      const { data, error } = await supabase
        .from(tableName)
        .insert(batchData)
        .select('id');
      
      console.log(`Insert operation completed. Error:`, error, `Data returned:`, data?.length);
        
      if (error) {
        console.error(`Insert error on attempt ${attempt}:`, error);
        
        // If it's the last attempt, return the error
        if (attempt === maxRetries) {
          return { success: false, error, actualInserted: 0 };
        }
        
        // Wait longer between retries (exponential backoff)
        await delay(attempt * 1000);
        continue;
      }
      
      // Verify the insertion actually worked by checking table count
      console.log(`Verifying insertion by checking ${tableName} record count...`);
      const { count: afterCount } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      const actualInserted = (afterCount || 0) - (beforeCount || 0);
      console.log(`After insertion: ${tableName} has ${afterCount} records (${actualInserted} new records)`);
      
      // Additional verification: check if specific records were inserted by querying for them
      if (tableName === 'salesdata' && batchData.length > 0) {
        const sampleRecord = batchData[0];
        const verificationQuery = await supabase
          .from('salesdata')
          .select('id')
          .eq('document_no', sampleRecord.document_no)
          .eq('item_code', sampleRecord.item_code)
          .eq('posting_date', sampleRecord.posting_date);
        
        console.log(`Verification query for sample record (${sampleRecord.document_no}):`, 
          verificationQuery.data?.length ? 'FOUND' : 'NOT FOUND', 
          verificationQuery.error ? `Error: ${verificationQuery.error.message}` : '');
      }
      
      // Check if the expected number of records were actually inserted
      if (actualInserted !== batchData.length) {
        console.warn(`Transaction may have been rolled back: Expected ${batchData.length} insertions, but only ${actualInserted} records were added`);
        
        // If no records were inserted and this isn't the last attempt, retry
        if (actualInserted === 0 && attempt < maxRetries) {
          console.log(`Retrying batch due to suspected transaction rollback...`);
          await delay(attempt * 1000);
          continue;
        }
        
        // If partial insertion occurred, this might be a constraint issue
        if (actualInserted > 0 && actualInserted < batchData.length) {
          return { 
            success: false, 
            error: new Error(`Partial insertion: ${actualInserted}/${batchData.length} records inserted. Possible duplicate records or constraint violations.`),
            actualInserted 
          };
        }
      }
      
      console.log(`Batch insertion verified: ${actualInserted} records successfully added to ${tableName}`);
      return { success: true, actualInserted };
      
    } catch (error) {
      console.error(`Exception on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        return { success: false, error, actualInserted: 0 };
      }
      await delay(attempt * 1000);
    }
  }
  
  return { success: false, error: new Error('Max retries reached'), actualInserted: 0 };
}

export async function processAndUploadSalesData(
  rawData: any[], 
  onProgress?: UploadProgressCallback,
  customBatchSize?: number
): Promise<{ successCount: number; errorCount: number }> {
  const startTime = Date.now();
  const errors: any[] = [];
  
  // Use custom batch size or fall back to default
  const batchSize = customBatchSize || BATCH_CONFIG.sales.batchSize;
  
  try {
    // Additional security check - verify current user's email before processing
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== 'fabien@repertoire.co.th') {
      const error = new Error('Unauthorized: You do not have permission to upload data');
      await logSyncOperation('salesdata_upload', 'failed', 0, 0, 0, [{ error: error.message }], Date.now() - startTime, undefined, batchSize);
      throw error;
    }
    
    console.log(`Starting optimized sales data processing with batch size: ${batchSize}...`);
    console.log('Raw data sample (first 2 rows):', rawData.slice(0, 2));
    
    // Transform the data to match database schema
    const transformedData = transformExcelData(rawData, SALES_HEADER_MAPPING);
    console.log('Transformed sales data sample:', transformedData.slice(0, 2));
    
    // Validate critical fields
    const validationErrors: string[] = [];
    transformedData.forEach((record, index) => {
      if (!record.posting_date) {
        validationErrors.push(`Row ${index + 1}: Missing posting_date`);
      }
      if (!record.document_no) {
        validationErrors.push(`Row ${index + 1}: Missing document_no`);
      }
    });
    
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      errors.push(...validationErrors.map(err => ({ validation_error: err })));
      toast.error(`Validation failed: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? '...' : ''}`);
    }
    
    // Use custom or default batch configuration
    const delayMs = BATCH_CONFIG.sales.delayMs;
    const totalRecords = transformedData.length;
    const totalBatches = Math.ceil(totalRecords / batchSize);
    
    console.log(`Processing ${totalRecords} records in ${totalBatches} batches of ${batchSize}`);
    
    if (onProgress) {
      onProgress({ current: 0, total: totalRecords });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const failedBatches: { batchNum: number; data: any[]; error: any }[] = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, totalRecords);
      const batch = transformedData.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${totalBatches} (records ${start + 1}-${end}) - batch size: ${batchSize}`);
      
      // Insert batch with retry logic
      const result = await retryBatch(batch, 'salesdata');
      
      if (result.success) {
        const actualInserted = result.actualInserted || batch.length;
        console.log(`Batch ${i + 1} uploaded successfully: ${actualInserted} records verified`);
        successCount += actualInserted;
        
        // If we inserted fewer records than expected, log this as a warning
        if (actualInserted < batch.length) {
          const discrepancy = batch.length - actualInserted;
          console.warn(`Batch ${i + 1}: Expected ${batch.length} insertions, but only ${actualInserted} verified (${discrepancy} missing)`);
          errorCount += discrepancy;
          errors.push({
            batch_number: i + 1,
            batch_size_used: batchSize,
            records_in_batch: batch.length,
            records_actually_inserted: actualInserted,
            error_message: `Silent insertion failure: ${discrepancy} records not inserted (possible trigger rollback)`,
            error_details: 'Records may have been rolled back by database triggers',
            sample_record: batch[0]
          });
        }
      } else {
        const actualInserted = result.actualInserted || 0;
        console.error(`Error in batch ${i + 1}:`, result.error);
        console.error('Sample failed record:', batch[0]);
        
        // Count successful and failed records accurately
        successCount += actualInserted;
        errorCount += (batch.length - actualInserted);
        
        failedBatches.push({ batchNum: i + 1, data: batch, error: result.error });
        
        // Add detailed error information including actual insertion count
        errors.push({
          batch_number: i + 1,
          batch_size_used: batchSize,
          records_in_batch: batch.length,
          records_actually_inserted: actualInserted,
          error_message: result.error?.message || 'Unknown error',
          error_details: result.error?.details || null,
          sample_record: batch[0]
        });
      }
      
      // Update progress
      if (onProgress) {
        onProgress({ 
          current: Math.min(end, totalRecords), 
          total: totalRecords 
        });
      }
      
      // Display progress in toast (less frequently to avoid spam)
      if (i % 10 === 0 || i === totalBatches - 1) {
        toast.info(
          `Uploading: ${Math.floor((end / totalRecords) * 100)}% complete (batch size: ${batchSize})`,
          { id: 'upload-progress' }
        );
      }
      
      // Add delay between batches to prevent overwhelming the database
      if (i < totalBatches - 1) {
        await delay(delayMs);
      }
    }
    
    // Log summary of failed batches
    if (failedBatches.length > 0) {
      console.log(`Failed batches summary:`, failedBatches.map(fb => ({
        batch: fb.batchNum,
        recordCount: fb.data.length,
        error: fb.error?.message || 'Unknown error'
      })));
    }
    
    const syncDuration = Date.now() - startTime;
    const syncStatus = errorCount === 0 ? 'success' : (successCount > 0 ? 'partial' : 'failed');
    
    // Log the sync operation with batch size
    await logSyncOperation(
      'salesdata_upload',
      syncStatus,
      totalRecords,
      successCount,
      0, // No updates for uploads
      errors,
      syncDuration,
      undefined,
      batchSize
    );
    
    console.log(`Sales data upload completed: ${successCount} successful, ${errorCount} failed (batch size: ${batchSize})`);
    
    // Return final results
    return { successCount, errorCount };
  } catch (error) {
    const syncDuration = Date.now() - startTime;
    await logSyncOperation(
      'salesdata_upload',
      'failed',
      rawData?.length || 0,
      0,
      0,
      [{ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : null }],
      syncDuration,
      undefined,
      batchSize
    );
    
    console.error('Processing error:', error);
    throw new Error(`Data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processAndUploadCreditMemoData(
  rawData: any[],
  onProgress?: UploadProgressCallback,
  customBatchSize?: number
): Promise<{ successCount: number; errorCount: number }> {
  const startTime = Date.now();
  const errors: any[] = [];
  
  // Use custom batch size or fall back to default
  const batchSize = customBatchSize || BATCH_CONFIG.creditMemo.batchSize;
  
  try {
    // Additional security check - verify current user's email before processing
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== 'fabien@repertoire.co.th') {
      const error = new Error('Unauthorized: You do not have permission to upload data');
      await logSyncOperation('credit_memo_upload', 'failed', 0, 0, 0, [{ error: error.message }], Date.now() - startTime, undefined, batchSize);
      throw error;
    }
    
    console.log(`Starting optimized credit memo data processing with batch size: ${batchSize}...`);
    console.log('Raw credit memo data (first 2 rows):', rawData.slice(0, 2));
    console.log('Credit memo column headers:', Object.keys(rawData[0] || {}));
    
    // Transform the data to match database schema
    const transformedData = transformExcelData(rawData, CREDIT_MEMO_HEADER_MAPPING);
    console.log('Transformed credit memo data sample:', transformedData.slice(0, 2));
    
    // Validate required fields are present
    for (let i = 0; i < transformedData.length; i++) {
      const record = transformedData[i];
      
      // Ensure posting_date is not null (required by database)
      if (!record.posting_date) {
        if (record.due_date) {
          console.log(`Record #${i+1}: Using due_date as posting_date fallback`);
          record.posting_date = record.due_date;
        } else {
          console.log(`Record #${i+1}: Using current date as posting_date fallback`);
          record.posting_date = new Date().toISOString();
        }
      }
    }
    
    // Use custom or default batch configuration
    const delayMs = BATCH_CONFIG.creditMemo.delayMs;
    const totalRecords = transformedData.length;
    const totalBatches = Math.ceil(totalRecords / batchSize);
    
    console.log(`Processing ${totalRecords} credit memo records in ${totalBatches} batches of ${batchSize}`);
    
    if (onProgress) {
      onProgress({ current: 0, total: totalRecords });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const failedBatches: { batchNum: number; data: any[]; error: any }[] = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, totalRecords);
      const batch = transformedData.slice(start, end);
      
      console.log(`Processing credit memo batch ${i + 1}/${totalBatches} (records ${start + 1}-${end}) - batch size: ${batchSize}`);
      
      // Insert batch with retry logic
      const result = await retryBatch(batch, 'credit_memos');
      
      if (result.success) {
        const actualInserted = result.actualInserted || batch.length;
        console.log(`Credit memo batch ${i + 1} uploaded successfully: ${actualInserted} records verified`);
        successCount += actualInserted;
        
        // If we inserted fewer records than expected, log this as a warning
        if (actualInserted < batch.length) {
          const discrepancy = batch.length - actualInserted;
          console.warn(`Credit memo batch ${i + 1}: Expected ${batch.length} insertions, but only ${actualInserted} verified (${discrepancy} missing)`);
          errorCount += discrepancy;
          errors.push({
            batch_number: i + 1,
            batch_size_used: batchSize,
            records_in_batch: batch.length,
            records_actually_inserted: actualInserted,
            error_message: `Silent insertion failure: ${discrepancy} records not inserted (possible trigger rollback)`,
            error_details: 'Records may have been rolled back by database triggers',
            sample_record: batch[0]
          });
        }
      } else {
        const actualInserted = result.actualInserted || 0;
        console.error(`Error in batch ${i + 1}:`, result.error);
        console.error('First record in failed batch:', batch[0]);
        
        // Count successful and failed records accurately
        successCount += actualInserted;
        errorCount += (batch.length - actualInserted);
        
        failedBatches.push({ batchNum: i + 1, data: batch, error: result.error });
        
        // Add detailed error information including actual insertion count
        errors.push({
          batch_number: i + 1,
          batch_size_used: batchSize,
          records_in_batch: batch.length,
          records_actually_inserted: actualInserted,
          error_message: result.error?.message || 'Unknown error',
          error_details: result.error?.details || null,
          sample_record: batch[0]
        });
      }
      
      // Update progress
      if (onProgress) {
        onProgress({ 
          current: Math.min(end, totalRecords), 
          total: totalRecords 
        });
      }
      
      // Display progress in toast (less frequently)
      if (i % 10 === 0 || i === totalBatches - 1) {
        toast.info(
          `Uploading credit memos: ${Math.floor((end / totalRecords) * 100)}% complete (batch size: ${batchSize})`,
          { id: 'upload-progress-credit-memo' }
        );
      }
      
      // Add delay between batches
      if (i < totalBatches - 1) {
        await delay(delayMs);
      }
    }
    
    // Log summary of failed batches
    if (failedBatches.length > 0) {
      console.log(`Failed credit memo batches summary:`, failedBatches.map(fb => ({
        batch: fb.batchNum,
        recordCount: fb.data.length,
        error: fb.error?.message || 'Unknown error'
      })));
    }
    
    const syncDuration = Date.now() - startTime;
    const syncStatus = errorCount === 0 ? 'success' : (successCount > 0 ? 'partial' : 'failed');
    
    // Log the sync operation with batch size
    await logSyncOperation(
      'credit_memo_upload',
      syncStatus,
      totalRecords,
      successCount,
      0, // No updates for uploads
      errors,
      syncDuration,
      undefined,
      batchSize
    );
    
    console.log(`Credit memo upload completed: ${successCount} successful, ${errorCount} failed (batch size: ${batchSize})`);
    
    // Return final results
    return { successCount, errorCount };
  } catch (error) {
    const syncDuration = Date.now() - startTime;
    await logSyncOperation(
      'credit_memo_upload',
      'failed',
      rawData?.length || 0,
      0,
      0,
      [{ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : null }],
      syncDuration,
      undefined,
      batchSize
    );
    
    console.error('Credit memo processing error:', error);
    throw new Error(`Credit memo data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processAndUploadCogsData(
  rawData: any[],
  onProgress?: UploadProgressCallback,
  customBatchSize?: number,
  selectedYear?: number,
  selectedMonth?: number
): Promise<{ successCount: number; errorCount: number }> {
  const startTime = Date.now();
  const errors: any[] = [];
  
  // Use custom batch size or fall back to default
  const batchSize = customBatchSize || BATCH_CONFIG.cogs.batchSize;
  
  try {
    // Additional security check - verify current user's email before processing
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== 'fabien@repertoire.co.th') {
      const error = new Error('Unauthorized: You do not have permission to upload data');
      await logSyncOperation('cogs_upload', 'failed', 0, 0, 0, [{ error: error.message }], Date.now() - startTime, undefined, batchSize);
      throw error;
    }
    
    console.log(`Starting COGS data processing with batch size: ${batchSize}...`);
    console.log('Raw COGS data sample (first 2 rows):', rawData.slice(0, 2));
    
    // Detailed header debugging
    const excelHeaders = Object.keys(rawData[0] || {});
    console.log('=== EXCEL HEADERS DEBUG ===');
    console.log('Total headers found:', excelHeaders.length);
    excelHeaders.forEach((header, index) => {
      console.log(`Header ${index + 1}: "${header}" (length: ${header.length})`);
    });
    
    console.log('=== MAPPING CHECK ===');
    Object.entries(COGS_HEADER_MAPPING).forEach(([excelHeader, dbColumn]) => {
      const found = excelHeaders.includes(excelHeader);
      console.log(`"${excelHeader}" -> "${dbColumn}": ${found ? 'FOUND' : 'NOT FOUND'}`);
      if (!found) {
        const similar = excelHeaders.filter(h => h.toLowerCase().includes(excelHeader.toLowerCase().substring(0, 5)));
        if (similar.length > 0) {
          console.log(`  Similar headers: ${similar.join(', ')}`);
        }
      }
    });
    
    // Transform the data to match database schema
    const transformedData = transformExcelData(rawData, COGS_HEADER_MAPPING);
    console.log('Transformed COGS data sample:', transformedData.slice(0, 2));
    
    // Add year/month and calculate fields for each record
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const processedData = transformedData.map((record, index) => {
      console.log(`Processing row ${index + 1}:`, {
        item_code: record.item_code,
        cogs_lcy: record.cogs_lcy,
        sales_qty: record.sales_qty,
        sales_lcy: record.sales_lcy
      });
      
      // Set year/month from selection or current date
      record.year = selectedYear || currentYear;
      record.month = selectedMonth || currentMonth;
      
      // Ensure numeric fields are properly converted
      const cogsLcy = Number(record.cogs_lcy) || 0;
      const salesQty = Number(record.sales_qty) || 0;
      const salesLcy = Number(record.sales_lcy) || 0;
      
      // Calculate cogs_unit = cogs_lcy / sales_qty (skip if sales_qty is 0)
      if (salesQty > 0 && cogsLcy > 0) {
        record.cogs_unit = cogsLcy / salesQty;
        console.log(`Row ${index + 1}: Calculated cogs_unit = ${record.cogs_unit} (${cogsLcy} / ${salesQty})`);
      } else if (salesQty === 0) {
        console.warn(`Row ${index + 1}: Skipping record with sales_qty = 0 (item: ${record.item_code})`);
        // Log this to sync_log table as requested
        errors.push({
          row_number: index + 1,
          warning_type: 'skipped_zero_sales_qty',
          item_code: record.item_code,
          message: `Skipped record with sales_qty = 0`
        });
        return null; // Will be filtered out
      } else {
        console.warn(`Row ${index + 1}: Cannot calculate cogs_unit - cogs_lcy: ${cogsLcy}, sales_qty: ${salesQty}`);
      }
      
      // Update the record with converted numeric values
      record.cogs_lcy = cogsLcy;
      record.sales_qty = salesQty;
      record.sales_lcy = salesLcy;
      
      // Calculate margin = ((sales_lcy - cogs_lcy) / sales_lcy) * 100
      if (salesLcy > 0 && cogsLcy > 0) {
        record.margin = ((salesLcy - cogsLcy) / salesLcy) * 100;
        console.log(`Row ${index + 1}: Calculated margin = ${record.margin}%`);
      }
      
      return record;
    }).filter(record => record !== null); // Remove skipped records
    
    // Validate required fields AFTER transformation and processing
    const validationErrors: string[] = [];
    processedData.forEach((record, index) => {
      // Check only truly required fields for COGS table
      if (!record.item_code) {
        validationErrors.push(`Row ${index + 1}: Missing item_code`);
      }
      if (!record.cogs_unit || record.cogs_unit <= 0) {
        validationErrors.push(`Row ${index + 1}: Missing or invalid cogs_unit (calculated from cogs_lcy/sales_qty)`);
      }
      if (!record.year) {
        validationErrors.push(`Row ${index + 1}: Missing year`);
      }
      if (!record.month) {
        validationErrors.push(`Row ${index + 1}: Missing month`);
      }
    });
    
    if (validationErrors.length > 0) {
      console.error('COGS validation errors:', validationErrors);
      errors.push(...validationErrors.map(err => ({ validation_error: err })));
      toast.error(`Validation failed: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? '...' : ''}`);
    }
    
    // Use custom or default batch configuration
    const delayMs = BATCH_CONFIG.cogs.delayMs;
    const totalRecords = processedData.length;
    const totalBatches = Math.ceil(totalRecords / batchSize);
    
    console.log(`Processing ${totalRecords} COGS records in ${totalBatches} batches of ${batchSize}`);
    
    if (onProgress) {
      onProgress({ current: 0, total: totalRecords });
    }
    
    let successCount = 0;
    let errorCount = 0;
    let updatedCount = 0;
    const failedBatches: { batchNum: number; data: any[]; error: any }[] = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, totalRecords);
      const batch = processedData.slice(start, end);
      
      console.log(`Processing COGS batch ${i + 1}/${totalBatches} (records ${start + 1}-${end}) - batch size: ${batchSize}`);
      
      try {
        // Insert COGS data (use regular insert since constraint doesn't exist yet)
        const { data, error, count } = await supabase
          .from('cogs')
          .insert(batch)
          .select('id');
        
        if (error) {
          console.error(`COGS batch ${i + 1} failed:`, error);
          errorCount += batch.length;
          failedBatches.push({ batchNum: i + 1, data: batch, error });
          errors.push({
            batch_number: i + 1,
            batch_size_used: batchSize,
            records_in_batch: batch.length,
            error_message: error.message,
            error_details: error.details || null,
            sample_record: batch[0]
          });
        } else {
          const recordsProcessed = data?.length || batch.length;
          console.log(`COGS batch ${i + 1} processed successfully: ${recordsProcessed} records`);
          successCount += recordsProcessed;
          // Note: upsert operations might update existing records rather than insert new ones
          updatedCount += recordsProcessed;
        }
      } catch (batchError) {
        console.error(`COGS batch ${i + 1} error:`, batchError);
        errorCount += batch.length;
        failedBatches.push({ batchNum: i + 1, data: batch, error: batchError });
        errors.push({
          batch_number: i + 1,
          batch_size_used: batchSize,
          records_in_batch: batch.length,
          error_message: batchError instanceof Error ? batchError.message : 'Unknown error',
          sample_record: batch[0]
        });
      }
      
      // Update progress
      if (onProgress) {
        onProgress({ 
          current: Math.min(end, totalRecords), 
          total: totalRecords 
        });
      }
      
      // Display progress in toast (less frequently to avoid spam)
      if (i % 10 === 0 || i === totalBatches - 1) {
        toast.info(
          `Uploading COGS: ${Math.floor((end / totalRecords) * 100)}% complete (batch size: ${batchSize})`,
          { id: 'upload-progress-cogs' }
        );
      }
      
      // Add delay between batches to prevent overwhelming the database
      if (i < totalBatches - 1) {
        await delay(delayMs);
      }
    }
    
    // Log summary of failed batches
    if (failedBatches.length > 0) {
      console.log(`Failed COGS batches summary:`, failedBatches.map(fb => ({
        batch: fb.batchNum,
        recordCount: fb.data.length,
        error: fb.error?.message || 'Unknown error'
      })));
    }
    
    const syncDuration = Date.now() - startTime;
    const syncStatus = errorCount === 0 ? 'success' : (successCount > 0 ? 'partial' : 'failed');
    
    // Log the sync operation with batch size
    await logSyncOperation(
      'cogs_upload',
      syncStatus,
      totalRecords,
      successCount,
      updatedCount,
      errors,
      syncDuration,
      undefined,
      batchSize
    );
    
    console.log(`COGS upload completed: ${successCount} successful, ${errorCount} failed (batch size: ${batchSize})`);
    
    // Return final results
    return { successCount, errorCount };
  } catch (error) {
    const syncDuration = Date.now() - startTime;
    await logSyncOperation(
      'cogs_upload',
      'failed',
      rawData?.length || 0,
      0,
      0,
      [{ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : null }],
      syncDuration,
      undefined,
      batchSize
    );
    
    console.error('COGS processing error:', error);
    throw new Error(`COGS data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleFileUpload(
  file: File, 
  isCreditmemo: boolean = false,
  onProgress?: UploadProgressCallback,
  customBatchSize?: number
): Promise<{ successCount: number; errorCount: number }> {
  // Additional security check - verify current user's email before processing
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== 'fabien@repertoire.co.th') {
    throw new Error('Unauthorized: You do not have permission to upload data');
  }
  
  console.log(`Starting optimized file upload process for: ${file.name} with batch size: ${customBatchSize || 'default'}`);
  
  // Read the Excel file
  const data = await readExcelFile(file);
  if (!data || data.length === 0) {
    throw new Error('No data found in the Excel file');
  }
  
  console.log(`Processing ${isCreditmemo ? 'credit memo' : 'sales'} file with ${data.length} records (batch size: ${customBatchSize || 'default'})`);
  console.log('File data first row sample:', data[0]);
  console.log('File headers detected:', Object.keys(data[0] || {}));
  
  // Process and upload the data with custom batch size
  if (isCreditmemo) {
    return processAndUploadCreditMemoData(data, onProgress, customBatchSize);
  } else {
    return processAndUploadSalesData(data, onProgress, customBatchSize);
  }
}

export async function handleCogsFileUpload(
  file: File,
  onProgress?: UploadProgressCallback,
  customBatchSize?: number,
  selectedYear?: number,
  selectedMonth?: number
): Promise<{ successCount: number; errorCount: number }> {
  // Additional security check - verify current user's email before processing
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== 'fabien@repertoire.co.th') {
    throw new Error('Unauthorized: You do not have permission to upload data');
  }
  
  console.log(`Starting COGS file upload process for: ${file.name} with batch size: ${customBatchSize || 'default'}`);
  
  // Read the Excel file
  const data = await readExcelFile(file);
  if (!data || data.length === 0) {
    throw new Error('No data found in the Excel file');
  }
  
  console.log(`Processing COGS file with ${data.length} records (batch size: ${customBatchSize || 'default'})`);
  console.log('File data first row sample:', data[0]);
  console.log('File headers detected:', Object.keys(data[0] || {}));
  
  // Process and upload the COGS data
  return processAndUploadCogsData(data, onProgress, customBatchSize, selectedYear, selectedMonth);
}
