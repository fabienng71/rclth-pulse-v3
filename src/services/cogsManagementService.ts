import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

// ============================================================================
// COGS Management Service
// ============================================================================
// Service for managing COGS data synchronization and operations
// Handles sync between cogs and cogs_master tables
// ============================================================================

export interface SyncValidationResult {
  item_code: string;
  master_cogs_unit: number | null;
  latest_cogs_unit: number | null;
  master_year: number | null;
  master_month: number | null;
  latest_year: number | null;
  latest_month: number | null;
  is_synced: boolean;
  sync_age_days: number | null;
}

export interface SyncStats {
  total_items_in_cogs: number;
  items_in_master: number;
  unsynced_items: number;
  missing_in_master: number;
  missing_in_cogs: number;
  last_sync_date: string | null;
  sync_percentage: number;
  generated_at: string;
}

export interface RefreshResult {
  success: boolean;
  processed_count?: number;
  error_count?: number;
  execution_time_seconds?: number;
  completed_at?: string;
  error_message?: string;
  error_code?: string;
  failed_at?: string;
}

export interface CogsImportData {
  item_code: string;
  description?: string;
  base_unit_code?: string;
  cogs_unit: number;
  unit_cost?: number;
  unit_price?: number;
  margin?: number;
  posting_group?: string;
  vendor_code?: string;
  year: number;
  month: number;
}

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duplicatesSkipped: number;
  recordsInserted: number;
}

class CogsManagementService {
  /**
   * Refresh the entire cogs_master table with latest data from cogs table
   */
  async refreshCogsMaster(): Promise<RefreshResult> {
    try {
      console.log('🔄 Starting COGS master refresh...');
      
      const { data, error } = await supabase.rpc('refresh_cogs_master');
      
      if (error) {
        console.error('❌ COGS master refresh failed:', error);
        throw new Error(`Failed to refresh COGS master: ${error.message}`);
      }
      
      console.log('✅ COGS master refresh completed:', data);
      return data as RefreshResult;
    } catch (error) {
      console.error('❌ Error in refreshCogsMaster:', error);
      throw error;
    }
  }

  /**
   * Validate synchronization between cogs and cogs_master tables
   */
  async validateSync(): Promise<SyncValidationResult[]> {
    try {
      console.log('🔍 Validating COGS synchronization...');
      
      const { data, error } = await supabase.rpc('validate_cogs_sync');
      
      if (error) {
        console.error('❌ COGS sync validation failed:', error);
        throw new Error(`Sync validation failed: ${error.message}`);
      }
      
      console.log(`✅ COGS sync validation completed. Found ${data?.length || 0} sync issues`);
      return data as SyncValidationResult[];
    } catch (error) {
      console.error('❌ Error in validateSync:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive synchronization statistics
   */
  async getSyncStats(): Promise<SyncStats> {
    try {
      console.log('📊 Fetching COGS sync statistics...');
      
      const { data, error } = await supabase.rpc('get_cogs_sync_stats');
      
      if (error) {
        console.error('❌ Failed to fetch COGS sync stats:', error);
        throw new Error(`Failed to fetch sync stats: ${error.message}`);
      }
      
      console.log('✅ COGS sync stats retrieved:', data);
      return data as SyncStats;
    } catch (error) {
      console.error('❌ Error in getSyncStats:', error);
      throw error;
    }
  }

  /**
   * Import COGS data from Excel file
   */
  async importCogsData(file: File): Promise<ImportResult> {
    try {
      console.log('📁 Starting COGS data import from file:', file.name);
      
      // Parse Excel file
      const cogsData = await this.parseCogsExcel(file);
      console.log(`📋 Parsed ${cogsData.length} COGS records from Excel`);
      
      if (cogsData.length === 0) {
        throw new Error('No valid COGS data found in the uploaded file');
      }

      // Validate data
      const validationErrors = this.validateCogsData(cogsData);
      if (validationErrors.length > 0) {
        throw new Error(`Data validation failed: ${validationErrors.join(', ')}`);
      }

      // Insert into cogs table (trigger will auto-sync to master)
      let recordsInserted = 0;
      const duplicatesSkipped = 0;
      const errors: string[] = [];
      
      // Process in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < cogsData.length; i += batchSize) {
        const batch = cogsData.slice(i, i + batchSize);
        
        try {
          const { data, error } = await supabase
            .from('cogs')
            .upsert(batch, { 
              onConflict: 'item_code,year,month',
              ignoreDuplicates: false 
            })
            .select('id');
          
          if (error) {
            console.error(`❌ Batch ${i / batchSize + 1} failed:`, error);
            errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
          } else {
            recordsInserted += data?.length || 0;
            console.log(`✅ Batch ${i / batchSize + 1} processed: ${data?.length || 0} records`);
          }
        } catch (batchError) {
          console.error(`❌ Batch ${i / batchSize + 1} error:`, batchError);
          errors.push(`Batch ${i / batchSize + 1}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
        }
      }
      
      const result: ImportResult = {
        success: errors.length === 0,
        recordsProcessed: cogsData.length,
        recordsInserted,
        duplicatesSkipped,
        errors
      };
      
      console.log('📊 COGS import completed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error in importCogsData:', error);
      throw error;
    }
  }

  /**
   * Parse COGS data from Excel file
   */
  private async parseCogsExcel(file: File): Promise<CogsImportData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with expected headers
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (rawData.length < 2) {
            throw new Error('Excel file must contain header row and data rows');
          }
          
          const headers = rawData[0].map((h: string) => h?.toString().toLowerCase().trim());
          const dataRows = rawData.slice(1);
          
          // Map expected column names
          const columnMap = {
            'item_code': ['item_code', 'item code', 'itemcode', 'code'],
            'description': ['description', 'desc', 'item_description'],
            'base_unit_code': ['base_unit_code', 'base unit code', 'unit_code', 'unit'],
            'cogs_unit': ['cogs_unit', 'cogs unit', 'cogs', 'cost_per_unit'],
            'unit_cost': ['unit_cost', 'unit cost', 'cost'],
            'unit_price': ['unit_price', 'unit price', 'price'],
            'margin': ['margin', 'margin_percent', 'margin %'],
            'posting_group': ['posting_group', 'posting group'],
            'vendor_code': ['vendor_code', 'vendor code', 'vendor'],
            'year': ['year'],
            'month': ['month']
          };
          
          // Find column indices
          const columnIndices: Record<string, number> = {};
          Object.entries(columnMap).forEach(([field, possibleNames]) => {
            const index = headers.findIndex(h => 
              possibleNames.some(name => h.includes(name))
            );
            if (index !== -1) {
              columnIndices[field] = index;
            }
          });
          
          // Validate required columns
          const requiredColumns = ['item_code', 'cogs_unit', 'year', 'month'];
          const missingColumns = requiredColumns.filter(col => !(col in columnIndices));
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }
          
          // Parse data rows
          const cogsData: CogsImportData[] = [];
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          
          dataRows.forEach((row, index) => {
            try {
              if (!row || row.length === 0 || !row[columnIndices.item_code]) {
                return; // Skip empty rows
              }
              
              const record: CogsImportData = {
                item_code: row[columnIndices.item_code]?.toString().trim() || '',
                cogs_unit: parseFloat(row[columnIndices.cogs_unit]) || 0,
                year: parseInt(row[columnIndices.year]) || currentYear,
                month: parseInt(row[columnIndices.month]) || currentMonth,
                description: row[columnIndices.description]?.toString().trim() || null,
                base_unit_code: row[columnIndices.base_unit_code]?.toString().trim() || null,
                unit_cost: columnIndices.unit_cost !== undefined ? parseFloat(row[columnIndices.unit_cost]) || null : null,
                unit_price: columnIndices.unit_price !== undefined ? parseFloat(row[columnIndices.unit_price]) || null : null,
                margin: columnIndices.margin !== undefined ? parseFloat(row[columnIndices.margin]) || null : null,
                posting_group: row[columnIndices.posting_group]?.toString().trim() || null,
                vendor_code: row[columnIndices.vendor_code]?.toString().trim() || null,
              };
              
              if (record.item_code && record.cogs_unit > 0) {
                cogsData.push(record);
              }
            } catch (rowError) {
              console.warn(`Warning: Skipping row ${index + 2} due to parsing error:`, rowError);
            }
          });
          
          resolve(cogsData);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate COGS data before import
   */
  private validateCogsData(data: CogsImportData[]): string[] {
    const errors: string[] = [];
    
    data.forEach((record, index) => {
      // Check required fields
      if (!record.item_code) {
        errors.push(`Row ${index + 1}: Item code is required`);
      }
      
      if (!record.cogs_unit || record.cogs_unit <= 0) {
        errors.push(`Row ${index + 1}: COGS unit must be greater than 0`);
      }
      
      if (!record.year || record.year < 2000 || record.year > 2100) {
        errors.push(`Row ${index + 1}: Year must be between 2000 and 2100`);
      }
      
      if (!record.month || record.month < 1 || record.month > 12) {
        errors.push(`Row ${index + 1}: Month must be between 1 and 12`);
      }
      
      // Check numeric values
      if (record.unit_cost !== null && (isNaN(record.unit_cost) || record.unit_cost < 0)) {
        errors.push(`Row ${index + 1}: Unit cost must be a valid non-negative number`);
      }
      
      if (record.unit_price !== null && (isNaN(record.unit_price) || record.unit_price < 0)) {
        errors.push(`Row ${index + 1}: Unit price must be a valid non-negative number`);
      }
    });
    
    return errors;
  }

  /**
   * Download COGS template Excel file
   */
  async downloadTemplate(): Promise<Blob> {
    const templateData = [
      [
        'item_code',
        'description', 
        'base_unit_code',
        'cogs_unit',
        'unit_cost',
        'unit_price',
        'margin',
        'posting_group',
        'vendor_code',
        'year',
        'month'
      ],
      [
        'ITEM001',
        'Sample Item Description',
        'PCS',
        25.50,
        20.00,
        35.00,
        42.86,
        'FINISHED',
        'VENDOR001',
        2025,
        1
      ]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'COGS Template');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}

// Export singleton instance
export const cogsManagementService = new CogsManagementService();