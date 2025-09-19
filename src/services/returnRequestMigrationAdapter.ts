/**
 * Migration adapter to handle conversion between legacy single-item returns
 * and enhanced multi-item returns during the deprecation period
 */

import { ReturnFormValues } from '@/hooks/returnFormSchema';
import { ReturnRequestFormData } from '@/components/forms/return/EnhancedReturnForm';
import { createEnhancedReturnRequest } from './enhancedReturnRequestService';

/**
 * Converts legacy ReturnFormValues to enhanced ReturnRequestFormData
 */
export const convertLegacyToEnhanced = (legacyData: ReturnFormValues): ReturnRequestFormData => {
  console.warn('⚠️ Converting legacy single-item return request to enhanced multi-item format');
  
  return {
    customerCode: legacyData.customerCode,
    customerName: '', // Will be resolved during submission
    returnDate: legacyData.returnDate,
    items: [{
      item_code: legacyData.productCode,
      description: '', // Will be resolved during submission
      quantity: legacyData.returnQuantity,
      unit: legacyData.unit || '',
      reason: legacyData.reason
    }],
    notes: legacyData.comment || '',
    priority: 'medium' as const // Default priority for legacy requests
  };
};

/**
 * Creates a return request from legacy data by converting it to enhanced format
 * @deprecated Use createEnhancedReturnRequest directly with ReturnRequestFormData
 */
export const createLegacyReturnRequest = async (
  legacyData: ReturnFormValues,
  userId: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  console.warn('⚠️ DEPRECATED: createLegacyReturnRequest is deprecated. Use createEnhancedReturnRequest directly.');
  
  try {
    const enhancedData = convertLegacyToEnhanced(legacyData);
    return await createEnhancedReturnRequest(enhancedData, userId);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    };
  }
};