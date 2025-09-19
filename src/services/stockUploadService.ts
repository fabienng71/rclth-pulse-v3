
import { read as readXLSX, utils } from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface RawStockItem {
  'No.': string;
  'Description': string;
  'Search Description'?: string;
  'Type'?: string;
  'Inventory': number;
}

export const uploadStockFromExcel = async (file: File): Promise<{
  success: boolean;
  message: string;
  updatedCount: number;
  errorItems?: string[];
}> => {
  try {
    // Read the Excel file with proper encoding handling
    const data = await file.arrayBuffer();
    const workbook = readXLSX(data, { 
      type: 'array',
      codepage: 65001, // UTF-8 codepage
      cellText: true,
      cellDates: true
    });
    
    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON with proper text handling
    const jsonData = utils.sheet_to_json<RawStockItem>(worksheet, {
      raw: false, // Use formatted text instead of raw values
      defval: '', // Default value for empty cells
    });
    
    if (!jsonData.length) {
      return {
        success: false,
        message: 'No data found in the Excel file',
        updatedCount: 0
      };
    }

    
    // Process the stock items
    const stockUpdates = jsonData.map(row => ({
      item_code: row['No.'],
      quantity: typeof row['Inventory'] === 'number' ? row['Inventory'] : 0,
      last_updated: new Date().toISOString()
    }));
    
    // First, check if the items exist in the items table
    const itemCodes = stockUpdates.map(item => item.item_code);
    
    const { data: existingItems, error: itemCheckError } = await supabase
      .from('items')
      .select('item_code')
      .in('item_code', itemCodes);
      
    if (itemCheckError) {
      return {
        success: false,
        message: 'Failed to verify item codes',
        updatedCount: 0
      };
    }
    
    // Filter for only existing items
    const existingItemCodes = new Set(existingItems.map(item => item.item_code));
    const validStockUpdates = stockUpdates.filter(item => existingItemCodes.has(item.item_code));
    const invalidItemCodes = stockUpdates
      .filter(item => !existingItemCodes.has(item.item_code))
      .map(item => item.item_code);
    
    if (!validStockUpdates.length) {
      return {
        success: false,
        message: 'No valid items found in the uploaded data',
        updatedCount: 0,
        errorItems: invalidItemCodes
      };
    }
    
    // Upsert stock data - now using the unique constraint on item_code
    const { data: result, error } = await supabase
      .from('stock_onhands')
      .upsert(validStockUpdates, { 
        onConflict: 'item_code',
        ignoreDuplicates: false
      });
      
    if (error) {
      return {
        success: false,
        message: `Failed to update stock data: ${error.message}`,
        updatedCount: 0
      };
    }
    
    return {
      success: true,
      message: `Successfully updated ${validStockUpdates.length} stock items`,
      updatedCount: validStockUpdates.length,
      errorItems: invalidItemCodes.length > 0 ? invalidItemCodes : undefined
    };
  } catch (error) {
    return {
      success: false,
      message: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      updatedCount: 0
    };
  }
};
