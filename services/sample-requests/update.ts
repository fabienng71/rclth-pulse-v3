import { supabase } from '@/integrations/supabase/client';
import { SampleRequestFormData } from './types';

/**
 * Updates an existing sample request and its items
 */
export const updateSampleRequest = async (id: string, data: SampleRequestFormData) => {
  console.log('Updating sample request with salesperson_code:', data.salespersonCode);
  
  // Update the main request
  const { error: requestError } = await supabase
    .from('sample_requests')
    .update({
      customer_code: data.customerCode,
      customer_name: data.customerName,
      salesperson_code: data.salespersonCode,
      follow_up_date: data.followUpDate?.toISOString().split('T')[0],
      notes: data.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (requestError) {
    throw requestError;
  }

  // Delete all existing items for this request
  const { error: deleteError } = await supabase
    .from('sample_request_items')
    .delete()
    .eq('request_id', id);

  if (deleteError) {
    throw deleteError;
  }

  // Insert all new items
  if (data.items.length > 0) {
    const timestamp = new Date().toISOString();
    const itemsWithRequestId = data.items.map(item => ({
      request_id: id,
      item_code: item.item_code,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      is_free: item.is_free || false,
      created_at: timestamp,
      updated_at: timestamp
    }));

    const { error: itemsError } = await supabase
      .from('sample_request_items')
      .insert(itemsWithRequestId);

    if (itemsError) {
      throw itemsError;
    }
  }

  return { success: true };
};
