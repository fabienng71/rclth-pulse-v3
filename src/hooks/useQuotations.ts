
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Quotation, QuotationWithItems, QuotationInsert, QuotationUpdate } from '@/types/quotations';
import { useToast } from '@/hooks/use-toast';
import { calculateTotal } from '@/components/quotations/details/items/QuotationItemsCalculations';

export const useQuotations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all quotations for the current user with customer search_name and items
  const { data: quotations, isLoading, error } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customers:customer_code (
            search_name
          ),
          leads:lead_id (
            id,
            full_name
          ),
          quotation_items (
            id,
            item_code,
            description,
            quantity,
            unit_price,
            discount_percent,
            unit_of_measure
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching quotations:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch quotations',
          variant: 'destructive',
        });
        throw error;
      }
      
      // Transform the data to include search_name
      const transformedData = data.map(quotation => {
        // For leads, make sure we use the lead name if available from the join
        if (quotation.is_lead && quotation.leads?.full_name && !quotation.lead_name) {
          quotation.lead_name = quotation.leads.full_name;
        }
        
        return {
          ...quotation,
          search_name: quotation.customers?.search_name,
        };
      });
      
      return transformedData as Quotation[];
    },
  });
  
  // Create a new quotation with archive set to false by default
  const createQuotation = useMutation({
    mutationFn: async (quotation: QuotationInsert) => {
      const newQuotation = {
        ...quotation,
        archive: false
      };

      const { data, error } = await supabase
        .from('quotations')
        .insert([newQuotation])
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating quotation:', error);
        toast({
          title: 'Error',
          description: 'Failed to create quotation',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: 'Success',
        description: 'Quotation created successfully',
      });
    },
  });
  
  // Update an existing quotation
  const updateQuotation = useMutation({
    mutationFn: async ({ id, quotation }: { id: string, quotation: QuotationUpdate }) => {
      const { data, error } = await supabase
        .from('quotations')
        .update(quotation)
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error updating quotation:', error);
        toast({
          title: 'Error',
          description: 'Failed to update quotation',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Quotation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      toast({
        title: 'Success',
        description: 'Quotation updated successfully',
      });
    },
  });
  
  // Delete a quotation
  const deleteQuotation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting quotation:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete quotation',
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: 'Success',
        description: 'Quotation deleted successfully',
      });
    },
  });

  // Toggle archive status
  const toggleArchive = useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase
        .from('quotations')
        .update({ archive })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating archive status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update archive status',
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: 'Success',
        description: 'Archive status updated successfully',
      });
    },
  });

  return {
    quotations,
    isLoading,
    error,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    toggleArchive,
  };
};

export const useQuotation = (id?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Fetch the quotation and its items, including customer search_name and lead information
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .select(`
          *,
          customers:customer_code (
            search_name
          ),
          leads:lead_id (
            id,
            full_name
          )
        `)
        .eq('id', id)
        .single();
        
      if (quotationError) {
        console.error('Error fetching quotation:', quotationError);
        toast({
          title: 'Error',
          description: 'Failed to fetch quotation details',
          variant: 'destructive',
        });
        throw quotationError;
      }
      
      // For leads, make sure we use the lead name if available from the join
      if (quotation.is_lead && quotation.leads?.full_name && !quotation.lead_name) {
        quotation.lead_name = quotation.leads.full_name;
      }
      
      const { data: items, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
        .order('created_at', { ascending: true });
        
      if (itemsError) {
        console.error('Error fetching quotation items:', itemsError);
        toast({
          title: 'Error',
          description: 'Failed to fetch quotation items',
          variant: 'destructive',
        });
        throw itemsError;
      }
      
      // Fetch the salesperson information if available
      let salesperson = null;
      if (quotation.salesperson_code) {
        const { data: salespersonData, error: salespersonError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('spp_code', quotation.salesperson_code)
          .maybeSingle();
          
        if (salespersonError) {
          console.error('Error fetching salesperson:', salespersonError);
        } else {
          salesperson = salespersonData;
        }
      }
      
      // Transform the data to include search_name at the top level
      const transformedQuotation = {
        ...quotation,
        search_name: quotation.customers?.search_name,
        items: items || [],
        salesperson_name: salesperson?.full_name || null
      };
      
      return transformedQuotation as QuotationWithItems;
    },
    enabled: Boolean(id),
  });
};
