
import { read as readXLSX, utils } from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { logSyncOperation } from '@/utils/syncLogging';

interface RawItemData {
  // Handle both naming conventions
  'Item Code'?: string;
  'item_code'?: string;
  'Description'?: string;
  'description'?: string;
  'Posting Group'?: string;
  'posting_group'?: string;
  'Base Unit Code'?: string;
  'base_unit_code'?: string;
  'Unit Price'?: number | string;
  'unit_price'?: number | string;
  'Vendor Code'?: string;
  'vendor_code'?: string;
  'Brand'?: string;
  'brand'?: string;
  'Attribute 1'?: string;
  'attribut_1'?: string;
  'Pricelist'?: string | boolean;
  'pricelist'?: string | boolean;
}

// Helper function to get value from either column naming convention
const getColumnValue = (row: RawItemData, spaceKey: string, underscoreKey: string): string => {
  const spaceValue = row[spaceKey as keyof RawItemData];
  const underscoreValue = row[underscoreKey as keyof RawItemData];
  return (spaceValue || underscoreValue)?.toString().trim() || '';
};

const getNumericValue = (row: RawItemData, spaceKey: string, underscoreKey: string): number => {
  const spaceValue = row[spaceKey as keyof RawItemData];
  const underscoreValue = row[underscoreKey as keyof RawItemData];
  const value = spaceValue || underscoreValue;
  
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleanPrice = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanPrice) || 0;
  }
  return 0;
};

const getBooleanValue = (row: RawItemData, spaceKey: string, underscoreKey: string): boolean => {
  const spaceValue = row[spaceKey as keyof RawItemData];
  const underscoreValue = row[underscoreKey as keyof RawItemData];
  const value = spaceValue || underscoreValue;
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['yes', 'true', 'x', '1'].includes(value.toLowerCase());
  }
  return false;
};

export const uploadItemsFromExcel = async (file: File): Promise<{
  success: boolean;
  message: string;
  insertedCount: number;
  skippedCount: number;
  errorItems?: string[];
}> => {
  const startTime = Date.now();
  const errors: string[] = [];
  
  try {
    console.log('Starting items upload process...');
    
    // Read the Excel file
    const data = await file.arrayBuffer();
    const workbook = readXLSX(data);
    
    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON
    const jsonData = utils.sheet_to_json<RawItemData>(worksheet);
    
    if (!jsonData.length) {
      const duration = Date.now() - startTime;
      await logSyncOperation({
        sync_type: 'items_upload',
        status: 'failed',
        records_processed: 0,
        records_inserted: 0,
        records_updated: 0,
        errors: ['No data found in the Excel file'],
        sync_duration_ms: duration
      });
      
      return {
        success: false,
        message: 'No data found in the Excel file',
        insertedCount: 0,
        skippedCount: 0
      };
    }

    console.log(`Parsed ${jsonData.length} items from Excel`);
    
    // Log available columns for debugging
    const firstRow = jsonData[0];
    const availableColumns = Object.keys(firstRow);
    console.log('Available columns in Excel:', availableColumns);
    
    // Process the items with flexible column name handling
    const itemsToInsert = jsonData.map((row, index) => {
      const itemCode = getColumnValue(row, 'Item Code', 'item_code');
      
      return {
        item_code: itemCode,
        description: getColumnValue(row, 'Description', 'description'),
        posting_group: getColumnValue(row, 'Posting Group', 'posting_group'),
        base_unit_code: getColumnValue(row, 'Base Unit Code', 'base_unit_code'),
        unit_price: getNumericValue(row, 'Unit Price', 'unit_price'),
        vendor_code: getColumnValue(row, 'Vendor Code', 'vendor_code'),
        brand: getColumnValue(row, 'Brand', 'brand'),
        attribut_1: getColumnValue(row, 'Attribute 1', 'attribut_1'),
        pricelist: getBooleanValue(row, 'Pricelist', 'pricelist')
      };
    });
    
    // Filter out items without item_code (required field)
    const validItems = itemsToInsert.filter(item => item.item_code);
    const invalidItems = itemsToInsert
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.item_code)
      .map(({ index }) => `Row ${index + 2}: Missing Item Code`);
    
    errors.push(...invalidItems);
    
    if (!validItems.length) {
      const duration = Date.now() - startTime;
      const errorDetails = [
        'No valid items found in the uploaded data',
        `Available columns: ${availableColumns.join(', ')}`,
        'Expected: Item Code or item_code column with valid values',
        ...errors
      ];
      
      await logSyncOperation({
        sync_type: 'items_upload',
        status: 'failed',
        records_processed: jsonData.length,
        records_inserted: 0,
        records_updated: 0,
        errors: errorDetails,
        sync_duration_ms: duration
      });
      
      return {
        success: false,
        message: 'No valid items found in the uploaded data',
        insertedCount: 0,
        skippedCount: 0,
        errorItems: errorDetails
      };
    }
    
    console.log(`Processing ${validItems.length} valid items...`);
    
    // Check for existing items
    const itemCodes = validItems.map(item => item.item_code);
    const { data: existingItems, error: checkError } = await supabase
      .from('items')
      .select('item_code')
      .in('item_code', itemCodes);
      
    if (checkError) {
      console.error('Error checking existing items:', checkError);
      const duration = Date.now() - startTime;
      await logSyncOperation({
        sync_type: 'items_upload',
        status: 'failed',
        records_processed: jsonData.length,
        records_inserted: 0,
        records_updated: 0,
        errors: [`Failed to verify existing items: ${checkError.message}`, ...errors],
        sync_duration_ms: duration
      });
      
      return {
        success: false,
        message: 'Failed to verify existing items',
        insertedCount: 0,
        skippedCount: 0
      };
    }
    
    // Filter out existing items
    const existingItemCodes = new Set(existingItems?.map(item => item.item_code) || []);
    const newItems = validItems.filter(item => !existingItemCodes.has(item.item_code));
    const skippedItems = validItems.filter(item => existingItemCodes.has(item.item_code));
    
    // Log skipped items as informational errors
    if (skippedItems.length > 0) {
      const skippedCodes = skippedItems.map(item => `${item.item_code} (already exists)`);
      errors.push(...skippedCodes.slice(0, 10)); // Limit to first 10 to avoid huge logs
      if (skippedCodes.length > 10) {
        errors.push(`... and ${skippedCodes.length - 10} more existing items`);
      }
    }
    
    if (!newItems.length) {
      const duration = Date.now() - startTime;
      await logSyncOperation({
        sync_type: 'items_upload',
        status: 'partial',
        records_processed: jsonData.length,
        records_inserted: 0,
        records_updated: 0,
        errors: errors.length > 0 ? errors : undefined,
        sync_duration_ms: duration
      });
      
      return {
        success: true,
        message: 'All items already exist in the database',
        insertedCount: 0,
        skippedCount: validItems.length,
        errorItems: errors.length > 0 ? errors : undefined
      };
    }
    
    console.log(`Inserting ${newItems.length} new items...`);
    
    // Insert new items
    const { data: result, error: insertError } = await supabase
      .from('items')
      .insert(newItems);
      
    const duration = Date.now() - startTime;
    
    if (insertError) {
      console.error('Error inserting items:', insertError);
      errors.push(`Database insertion error: ${insertError.message}`);
      
      await logSyncOperation({
        sync_type: 'items_upload',
        status: 'failed',
        records_processed: jsonData.length,
        records_inserted: 0,
        records_updated: 0,
        errors: errors,
        sync_duration_ms: duration
      });
      
      return {
        success: false,
        message: `Failed to insert items: ${insertError.message}`,
        insertedCount: 0,
        skippedCount: 0
      };
    }
    
    // Determine status based on results
    const status = errors.length > 0 ? 'partial' : 'success';
    
    await logSyncOperation({
      sync_type: 'items_upload',
      status,
      records_processed: jsonData.length,
      records_inserted: newItems.length,
      records_updated: 0,
      errors: errors.length > 0 ? errors : undefined,
      sync_duration_ms: duration
    });
    
    console.log(`Items upload completed: ${newItems.length} inserted, ${skippedItems.length} skipped`);
    
    return {
      success: true,
      message: `Successfully processed ${newItems.length} new items. ${skippedItems.length} items were skipped (already exist).`,
      insertedCount: newItems.length,
      skippedCount: skippedItems.length,
      errorItems: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error processing items upload:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Processing error: ${errorMessage}`);
    
    await logSyncOperation({
      sync_type: 'items_upload',
      status: 'failed',
      records_processed: 0,
      records_inserted: 0,
      records_updated: 0,
      errors: errors,
      sync_duration_ms: duration
    });
    
    return {
      success: false,
      message: `Error processing file: ${errorMessage}`,
      insertedCount: 0,
      skippedCount: 0
    };
  }
};
