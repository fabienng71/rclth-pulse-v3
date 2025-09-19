
import { supabase } from '@/integrations/supabase/client';
import { SampleRequestFormData } from './types';
import { createAdminNotification } from '../notificationService';

export const createSampleRequest = async (data: SampleRequestFormData, userId?: string): Promise<{ success: boolean; id?: string; error?: string }> => {
  if (!data.customerCode || !data.customerName) {
    return { success: false, error: 'Customer information is required' };
  }

  try {
    // Convert Date to ISO string for the database
    const followUpDateString = data.followUpDate ? data.followUpDate.toISOString() : null;
    
    // Insert the main sample request record
    const { data: request, error } = await supabase
      .from('sample_requests')
      .insert({
        customer_code: data.customerCode,
        customer_name: data.customerName,
        search_name: data.searchName || null, // Ensure searchName exists or set to null
        notes: data.notes,
        follow_up_date: followUpDateString,
        created_by_name: data.createdByName,
        salesperson_code: data.salespersonCode
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sample request:', error);
      return { success: false, error: error.message };
    }

    if (request && data.items?.length > 0) {
      // Insert all items for this sample request
      const itemsToInsert = data.items.map(item => ({
        request_id: request.id,
        item_code: item.item_code,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        is_free: item.is_free || false
      }));

      const { error: itemsError } = await supabase
        .from('sample_request_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error inserting sample request items:', itemsError);
        return { success: false, error: itemsError.message };
      }
    }

    // Send notification to admins about the new sample request
    if (request && request.id) {
      await createAdminNotification(
        'sample_request',
        request.id,
        'New Sample Request',
        `A new sample request has been created for ${data.customerName}`
      );
    }

    return { success: true, id: request?.id };
  } catch (error) {
    console.error('Error in createSampleRequest:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};
