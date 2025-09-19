
import { supabase } from '@/integrations/supabase/client';
import { ReturnRequest } from '../ReturnRequestTable';

// Define the CreateReturnRequestData type that was missing
export interface CreateReturnRequestData {
  customerCode: string;
  productCode: string;
  returnQuantity: number;
  returnDate: string;
  reason: string;
  comment?: string;
}

export const fetchReturnRequests = async (isAdmin: boolean, userId: string | undefined, nameFilter: string) => {
  if (!userId) {
    return { data: [], error: new Error('No user ID provided') };
  }

  let query = supabase
    .from('return_requests')
    .select(`
      *,
      customers:customer_code (
        search_name,
        customer_name
      ),
      items:product_code (
        description
      )
    `)
    .is('deleted', false);

  if (!isAdmin) {
    query = query.eq('created_by', userId);
  } else if (nameFilter) {
    query = query.ilike('full_name', `%${nameFilter}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  return { data, error };
};

export const deleteReturnRequest = async (id: string, user: any) => {
  const { data: checkData, error: checkError } = await supabase
    .from('return_requests')
    .select('id')
    .eq('id', id)
    .is('deleted', false);

  if (checkError || !checkData?.length) {
    throw new Error('Could not verify if request exists');
  }

  const { data: requestData, error: requestError } = await supabase
    .from('return_requests')
    .select('created_by, id')
    .eq('id', id)
    .is('deleted', false)
    .single();

  if (requestError) {
    throw new Error('Could not verify request ownership');
  }

  const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
  const isOwner = requestData.created_by === user.id;

  if (!isAdmin && !isOwner) {
    throw new Error('You do not have permission to delete this request');
  }

  const { error: updateError } = await supabase
    .from('return_requests')
    .update({ 
      deleted: true, 
      updated_at: new Date().toISOString() 
    } as any)
    .match({ id: id });

  if (updateError) {
    throw updateError;
  }

  return { success: true };
};
