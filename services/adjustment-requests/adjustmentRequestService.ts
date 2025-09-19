import { supabase } from '@/integrations/supabase/client';
import { AdjustmentRequest, AdjustmentRequestItem, AdjustmentRequestWithItems, AdjustmentFormData } from './types';

export class AdjustmentRequestService {
  static async createAdjustmentRequest(formData: AdjustmentFormData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch stock data for all items
    const itemCodes = formData.items.map(item => item.item_code);
    const { data: stockData, error: stockError } = await supabase
      .from('stock_onhands')
      .select('item_code, quantity')
      .in('item_code', itemCodes);

    if (stockError) throw stockError;

    // Fetch COGS data for all items
    const { data: cogsData, error: cogsError } = await supabase
      .from('cogs_master')
      .select('item_code, cogs_unit')
      .in('item_code', itemCodes);

    if (cogsError) throw cogsError;

    // Create lookup maps
    const stockLookup = (stockData || []).reduce((acc, item) => {
      acc[item.item_code] = item.quantity || 0;
      return acc;
    }, {} as Record<string, number>);

    const cogsLookup = (cogsData || []).reduce((acc, item) => {
      acc[item.item_code] = item.cogs_unit || 0;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total cost using fetched data
    const totalCost = formData.items.reduce((sum, item) => {
      const adjustmentValue = parseFloat(item.adjustment_value || '0') || 0;
      const cogsUnit = cogsLookup[item.item_code] || 0;
      return sum + (adjustmentValue * cogsUnit);
    }, 0);

    // Create the main adjustment request
    const { data: adjustmentRequest, error: adjustmentError } = await (supabase as any)
      .from('adjustment_requests')
      .insert({
        reason: formData.reason,
        notes: formData.notes,
        total_cost: totalCost,
        status: 'submitted',
        created_by: user.id
      })
      .select('id')
      .single();

    if (adjustmentError) throw adjustmentError;

    // Create adjustment request items with correct stock and COGS data
    const itemsToInsert = formData.items.map(item => {
      const currentStock = stockLookup[item.item_code] || 0;
      const cogsUnit = cogsLookup[item.item_code] || 0;
      const adjustmentValue = parseFloat(item.adjustment_value || '0') || 0;
      return {
        adjustment_request_id: adjustmentRequest.id,
        item_code: item.item_code,
        description: item.description,
        current_stock: currentStock,
        adjustment_value: adjustmentValue,
        unit_cost: cogsUnit,
        total_cost: (adjustmentValue * cogsUnit)
      };
    });

    const { error: itemsError } = await (supabase as any)
      .from('adjustment_request_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return adjustmentRequest.id;
  }

  static async getAdjustmentRequests(): Promise<AdjustmentRequestWithItems[]> {
    const { data: requests, error: requestsError } = await (supabase as any)
      .from('adjustment_requests')
      .select(`
        *,
        adjustment_request_items (*)
      `)
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    return requests || [];
  }

  static async getAdjustmentRequest(id: string): Promise<AdjustmentRequestWithItems | null> {
    const { data: request, error: requestError } = await (supabase as any)
      .from('adjustment_requests')
      .select(`
        *,
        adjustment_request_items (*)
      `)
      .eq('id', id)
      .single();

    if (requestError) throw requestError;

    return request;
  }

  static async updateAdjustmentRequestStatus(id: string, status: 'submitted' | 'approved'): Promise<void> {
    const { error } = await (supabase as any)
      .from('adjustment_requests')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteAdjustmentRequest(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('adjustment_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}