import { supabase } from '@/integrations/supabase/client';
import { WriteoffRequest, WriteoffRequestItem, WriteoffRequestWithItems, WriteoffFormData } from './types';

export class WriteoffRequestService {
  static async createWriteoffRequest(formData: WriteoffFormData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch COGS data for all items
    const itemCodes = formData.items.map(item => item.item_code);
    const { data: cogsData, error: cogsError } = await supabase
      .from('cogs_master')
      .select('item_code, cogs_unit')
      .in('item_code', itemCodes);

    if (cogsError) throw cogsError;

    // Create a lookup map for COGS data
    const cogsLookup = (cogsData || []).reduce((acc, item) => {
      acc[item.item_code] = item.cogs_unit || 0;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total cost using fetched COGS data
    const totalCost = formData.items.reduce((sum, item) => {
      const cogsUnit = cogsLookup[item.item_code] || 0;
      return sum + (item.quantity * cogsUnit);
    }, 0);

    // Create the main writeoff request using any type to bypass TypeScript
    const { data: writeoffRequest, error: writeoffError } = await (supabase as any)
      .from('writeoff_requests')
      .insert({
        reason: formData.reason,
        notes: formData.notes,
        total_cost: totalCost,
        status: 'submitted',
        created_by: user.id
      })
      .select('id')
      .single();

    if (writeoffError) throw writeoffError;

    // Create writeoff request items with correct COGS data
    const itemsToInsert = formData.items.map(item => {
      const cogsUnit = cogsLookup[item.item_code] || 0;
      return {
        writeoff_request_id: writeoffRequest.id,
        item_code: item.item_code,
        description: item.description,
        quantity: item.quantity,
        exp_date: item.exp_date.toISOString().split('T')[0],
        cogs_unit: cogsUnit,
        total_cost: (item.quantity * cogsUnit)
      };
    });

    const { error: itemsError } = await (supabase as any)
      .from('writeoff_request_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return writeoffRequest.id;
  }

  static async getWriteoffRequests(): Promise<WriteoffRequestWithItems[]> {
    // Get writeoff requests with items using any type to bypass TypeScript
    const { data: requests, error: requestsError } = await (supabase as any)
      .from('writeoff_requests')
      .select(`
        *,
        writeoff_request_items (*)
      `)
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    return requests || [];
  }

  static async getWriteoffRequest(id: string): Promise<WriteoffRequestWithItems | null> {
    // Get the writeoff request with items using any type to bypass TypeScript
    const { data: request, error: requestError } = await (supabase as any)
      .from('writeoff_requests')
      .select(`
        *,
        writeoff_request_items (*)
      `)
      .eq('id', id)
      .single();

    if (requestError) throw requestError;

    return request;
  }

  static async updateWriteoffRequestStatus(id: string, status: 'submitted' | 'approved'): Promise<void> {
    const { error } = await (supabase as any)
      .from('writeoff_requests')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteWriteoffRequest(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('writeoff_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}