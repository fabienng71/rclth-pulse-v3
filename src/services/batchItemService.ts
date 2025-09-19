import { supabase } from '@/integrations/supabase/client';
import { logSyncOperation } from '@/utils/syncLogging';

interface BatchEditData {
  description?: string;
  posting_group?: string;
  base_unit_code?: string;
  unit_price?: number;
  vendor_code?: string;
  brand?: string;
  attribut_1?: string;
  pricelist?: boolean;
}

interface BatchEditOptions {
  updateDescription: boolean;
  updatePostingGroup: boolean;
  updateBaseUnitCode: boolean;
  updateUnitPrice: boolean;
  updateVendorCode: boolean;
  updateBrand: boolean;
  updateAttribut1: boolean;
  updatePricelist: boolean;
}

export const batchUpdateItems = async (
  itemCodes: string[],
  updateData: BatchEditData,
  options: BatchEditOptions
): Promise<{
  success: boolean;
  message: string;
  updatedCount: number;
  errors?: string[];
}> => {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    if (itemCodes.length === 0) {
      return {
        success: false,
        message: 'No items selected for update',
        updatedCount: 0
      };
    }

    // Build the update object based on selected options
    const updateObject: Partial<BatchEditData> = {};
    
    if (options.updateDescription) updateObject.description = updateData.description;
    if (options.updatePostingGroup) updateObject.posting_group = updateData.posting_group;
    if (options.updateBaseUnitCode) updateObject.base_unit_code = updateData.base_unit_code;
    if (options.updateUnitPrice) updateObject.unit_price = updateData.unit_price;
    if (options.updateVendorCode) updateObject.vendor_code = updateData.vendor_code;
    if (options.updateBrand) updateObject.brand = updateData.brand;
    if (options.updateAttribut1) updateObject.attribut_1 = updateData.attribut_1;
    if (options.updatePricelist) updateObject.pricelist = updateData.pricelist;

    if (Object.keys(updateObject).length === 0) {
      return {
        success: false,
        message: 'No fields selected for update',
        updatedCount: 0
      };
    }

    // Process in chunks to avoid overwhelming the database
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < itemCodes.length; i += chunkSize) {
      chunks.push(itemCodes.slice(i, i + chunkSize));
    }

    let totalUpdated = 0;
    const failedItems: string[] = [];

    for (const chunk of chunks) {
      try {
        const { data, error } = await supabase
          .from('items')
          .update(updateObject)
          .in('item_code', chunk)
          .select('item_code');

        if (error) {
          errors.push(`Chunk update failed: ${error.message}`);
          failedItems.push(...chunk);
          continue;
        }

        totalUpdated += data?.length || 0;
      } catch (chunkError) {
        const errorMessage = chunkError instanceof Error ? chunkError.message : 'Unknown error';
        errors.push(`Chunk processing error: ${errorMessage}`);
        failedItems.push(...chunk);
      }
    }

    const duration = Date.now() - startTime;
    const status = errors.length > 0 ? 'partial' : 'success';

    await logSyncOperation({
      sync_type: 'batch_item_update',
      status,
      records_processed: itemCodes.length,
      records_inserted: 0,
      records_updated: totalUpdated,
      errors: errors.length > 0 ? errors : undefined,
      sync_duration_ms: duration
    });

    if (totalUpdated === 0) {
      return {
        success: false,
        message: 'Failed to update any items',
        updatedCount: 0,
        errors
      };
    }

    const successMessage = totalUpdated === itemCodes.length
      ? `Successfully updated all ${totalUpdated} items`
      : `Updated ${totalUpdated} of ${itemCodes.length} items (${itemCodes.length - totalUpdated} failed)`;

    return {
      success: true,
      message: successMessage,
      updatedCount: totalUpdated,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Batch update error: ${errorMessage}`);

    await logSyncOperation({
      sync_type: 'batch_item_update',
      status: 'failed',
      records_processed: itemCodes.length,
      records_inserted: 0,
      records_updated: 0,
      errors,
      sync_duration_ms: duration
    });

    return {
      success: false,
      message: `Batch update failed: ${errorMessage}`,
      updatedCount: 0,
      errors
    };
  }
};

export const batchDeleteItems = async (
  itemCodes: string[]
): Promise<{
  success: boolean;
  message: string;
  deletedCount: number;
  errors?: string[];
}> => {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    if (itemCodes.length === 0) {
      return {
        success: false,
        message: 'No items selected for deletion',
        deletedCount: 0
      };
    }

    // Process in chunks
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < itemCodes.length; i += chunkSize) {
      chunks.push(itemCodes.slice(i, i + chunkSize));
    }

    let totalDeleted = 0;
    const failedItems: string[] = [];

    for (const chunk of chunks) {
      try {
        const { data, error } = await supabase
          .from('items')
          .delete()
          .in('item_code', chunk)
          .select('item_code');

        if (error) {
          errors.push(`Chunk deletion failed: ${error.message}`);
          failedItems.push(...chunk);
          continue;
        }

        totalDeleted += data?.length || 0;
      } catch (chunkError) {
        const errorMessage = chunkError instanceof Error ? chunkError.message : 'Unknown error';
        errors.push(`Chunk processing error: ${errorMessage}`);
        failedItems.push(...chunk);
      }
    }

    const duration = Date.now() - startTime;
    const status = errors.length > 0 ? 'partial' : 'success';

    await logSyncOperation({
      sync_type: 'batch_item_delete',
      status,
      records_processed: itemCodes.length,
      records_inserted: 0,
      records_updated: 0,
      errors: errors.length > 0 ? errors : undefined,
      sync_duration_ms: duration
    });

    if (totalDeleted === 0) {
      return {
        success: false,
        message: 'Failed to delete any items',
        deletedCount: 0,
        errors
      };
    }

    const successMessage = totalDeleted === itemCodes.length
      ? `Successfully deleted all ${totalDeleted} items`
      : `Deleted ${totalDeleted} of ${itemCodes.length} items (${itemCodes.length - totalDeleted} failed)`;

    return {
      success: true,
      message: successMessage,
      deletedCount: totalDeleted,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Batch deletion error: ${errorMessage}`);

    await logSyncOperation({
      sync_type: 'batch_item_delete',
      status: 'failed',
      records_processed: itemCodes.length,
      records_inserted: 0,
      records_updated: 0,
      errors,
      sync_duration_ms: duration
    });

    return {
      success: false,
      message: `Batch deletion failed: ${errorMessage}`,
      deletedCount: 0,
      errors
    };
  }
};

export const exportItemsToCSV = async (itemCodes: string[]): Promise<{
  success: boolean;
  message: string;
  csvData?: string;
}> => {
  try {
    if (itemCodes.length === 0) {
      return {
        success: false,
        message: 'No items selected for export'
      };
    }

    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .in('item_code', itemCodes)
      .order('item_code', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch items for export: ${error.message}`);
    }

    if (!items || items.length === 0) {
      return {
        success: false,
        message: 'No items found for export'
      };
    }

    // Generate CSV headers
    const headers = [
      'Item Code',
      'Description',
      'Posting Group',
      'Base Unit Code',
      'Unit Price',
      'Vendor Code',
      'Brand',
      'Attribute 1',
      'Pricelist'
    ];

    // Generate CSV rows
    const rows = items.map(item => [
      item.item_code || '',
      item.description || '',
      item.posting_group || '',
      item.base_unit_code || '',
      item.unit_price?.toString() || '0',
      item.vendor_code || '',
      item.brand || '',
      item.attribut_1 || '',
      item.pricelist ? 'Yes' : 'No'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return {
      success: true,
      message: `Successfully exported ${items.length} items`,
      csvData: csvContent
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Export failed: ${errorMessage}`
    };
  }
};