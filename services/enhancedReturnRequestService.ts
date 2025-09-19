import { supabase } from '@/integrations/supabase/client';
import { ReturnRequestFormData } from '@/components/forms/return/EnhancedReturnForm';

export interface ReturnRequestWithItems {
  id: string;
  customer_code: string;
  return_date: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  customers: {
    customer_name: string;
    search_name: string | null;
  } | null;
  items: Array<{
    id: string;
    item_code: string;
    description: string;
    quantity: number;
    unit: string;
    reason: string;
  }>;
  profiles: {
    full_name: string;
  } | null;
}

/**
 * Creates a new enhanced return request with multiple items
 */
export const createEnhancedReturnRequest = async (
  data: ReturnRequestFormData, 
  userId: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Get the user's full name from profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`);
    }

    // Create the main return request
    const { data: returnRequest, error: returnRequestError } = await supabase
      .from('return_requests')
      .insert({
        customer_code: data.customerCode,
        return_date: data.returnDate.toISOString(),
        priority: data.priority,
        notes: data.notes,
        status: 'sent',
        created_by: userId,
        full_name: profileData?.full_name,
        // Keep these fields for backward compatibility but they won't be used
        product_code: data.items[0]?.item_code || '',
        return_quantity: data.items[0]?.quantity || 0,
        reason: data.items[0]?.reason || '',
        comment: data.notes
      })
      .select('id')
      .single();

    if (returnRequestError) {
      throw new Error(`Failed to create return request: ${returnRequestError.message}`);
    }

    // Create the return request items
    const itemsToInsert = data.items.map(item => ({
      return_request_id: returnRequest.id,
      item_code: item.item_code,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      reason: item.reason
    }));

    const { error: itemsError } = await supabase
      .from('return_request_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback the main request if items insertion fails
      await supabase
        .from('return_requests')
        .delete()
        .eq('id', returnRequest.id);
      
      throw new Error(`Failed to create return request items: ${itemsError.message}`);
    }

    return { success: true, id: returnRequest.id };
  } catch (error) {
    console.error('Error creating enhanced return request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Fetches an enhanced return request with all its items
 */
export const fetchEnhancedReturnRequest = async (id: string): Promise<ReturnRequestWithItems> => {
  // Get the main return request data
  const { data: returnRequest, error: returnRequestError } = await supabase
    .from('return_requests')
    .select(`
      *,
      customers:customer_code (
        customer_name,
        search_name
      )
    `)
    .eq('id', id)
    .is('deleted', false)
    .single();

  if (returnRequestError) {
    throw new Error(`Failed to fetch return request: ${returnRequestError.message}`);
  }

  if (!returnRequest) {
    throw new Error('Return request not found');
  }

  // Get the items for this return request
  const { data: items, error: itemsError } = await supabase
    .from('return_request_items')
    .select('*')
    .eq('return_request_id', id)
    .order('created_at', { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to fetch return request items: ${itemsError.message}`);
  }

  // Get the creator's profile
  let creatorProfile = null;
  if (returnRequest.created_by) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', returnRequest.created_by)
      .maybeSingle();
      
    if (!profileError && profileData) {
      creatorProfile = profileData;
    }
  }

  return {
    ...returnRequest,
    items: items || [],
    profiles: creatorProfile
  } as ReturnRequestWithItems;
};

/**
 * Fetches all enhanced return requests with basic info and item counts
 */
export const fetchEnhancedReturnRequests = async (
  isAdmin: boolean, 
  userId: string | undefined, 
  nameFilter?: string
) => {
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
      )
    `)
    .is('deleted', false);

  if (!isAdmin) {
    query = query.eq('created_by', userId);
  } else if (nameFilter) {
    query = query.or(`full_name.ilike.%${nameFilter}%,customers.customer_name.ilike.%${nameFilter}%,customers.search_name.ilike.%${nameFilter}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return { data: [], error };
  }

  // Get item counts for each return request
  const requestsWithItemCounts = await Promise.all(
    (data || []).map(async (request) => {
      const { count } = await supabase
        .from('return_request_items')
        .select('*', { count: 'exact', head: true })
        .eq('return_request_id', request.id);

      return {
        ...request,
        item_count: count || 0
      };
    })
  );

  return { data: requestsWithItemCounts, error: null };
};
