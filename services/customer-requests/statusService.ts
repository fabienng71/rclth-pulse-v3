
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { ServiceResult } from './types';

// Approve or reject a customer request
export const updateRequestStatus = async (
  id: string, 
  status: 'approved' | 'rejected' | 'pending' | 'draft'
): Promise<ServiceResult> => {
  const { id: userId } = useAuthStore.getState().user || {};
  
  if (!userId) {
    return { success: false, error: new Error('User not authenticated') };
  }

  try {
    const updateData: any = { status };
    
    // Only add approved_by and approved_at when the status is approved or rejected
    if (status === 'approved' || status === 'rejected') {
      updateData.approved_by = userId;
      updateData.approved_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('customer_requests')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating request status:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};
