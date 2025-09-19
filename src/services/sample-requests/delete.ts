
import { supabase } from '@/integrations/supabase/client';

/**
 * Deletes a sample request and its items
 */
export const deleteSampleRequest = async (id: string) => {
  // Delete all items for this request first (cascade doesn't work automatically)
  const { error: itemsError } = await supabase
    .from('sample_request_items')
    .delete()
    .eq('request_id', id);

  if (itemsError) {
    throw itemsError;
  }

  // Delete the request itself
  const { error: requestError } = await supabase
    .from('sample_requests')
    .delete()
    .eq('id', id);

  if (requestError) {
    throw requestError;
  }

  return { success: true };
};
