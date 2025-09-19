import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeadProductInterest, CategoryPerformance, ProductCategory, ProductItem } from '@/types/productInterests';

interface UseProductInterestsReturn {
  interests: LeadProductInterest[];
  categories: ProductCategory[];
  categoryPerformance: CategoryPerformance[];
  isLoading: boolean;
  error: string | null;
  createInterest: (interest: Omit<LeadProductInterest, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInterest: (id: string, updates: Partial<LeadProductInterest>) => Promise<void>;
  deleteInterest: (id: string) => Promise<void>;
  loadInterestsForLead: (leadId: string) => Promise<void>;
  loadCategoryPerformance: (customerChannel?: string) => Promise<void>;
  getItemsForCategory: (postingGroup: string) => Promise<ProductItem[]>;
}

export const useProductInterests = (): UseProductInterestsReturn => {
  const [interests, setInterests] = useState<LeadProductInterest[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load available categories from the database
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Query your actual categories table
      const { data, error } = await supabase
        .from('categories')
        .select('posting_group, description')
        .order('description');

      if (error) throw error;

      // Transform to match our interface
      const categoriesData: ProductCategory[] = data?.map(category => ({
        posting_group: category.posting_group,
        description: category.description || category.posting_group,
      })) || [];
      
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error Loading Categories",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load product interests for a specific lead
  const loadInterestsForLead = useCallback(async (leadId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('lead_product_interests')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setInterests(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error Loading Product Interests",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load category performance data
  const loadCategoryPerformance = useCallback(async (customerChannel?: string) => {
    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .rpc('get_category_performance_insights', {
          p_customer_channel: customerChannel || null,
          p_posting_group: null
        });

      if (fetchError) throw fetchError;

      setCategoryPerformance(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading category performance:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get items for a specific category
  const getItemsForCategory = useCallback(async (postingGroup: string): Promise<ProductItem[]> => {
    try {
      // Query your actual items table
      const { data, error } = await supabase
        .from('items')
        .select('item_code, description, posting_group, vendor_code, unit_price')
        .eq('posting_group', postingGroup)
        .order('description');

      if (error) throw error;

      // Transform to match our interface
      const itemsData: ProductItem[] = data?.map(item => ({
        item_code: item.item_code,
        description: item.description || item.item_code,
        posting_group: item.posting_group,
        vendor_code: item.vendor_code,
        unit_price: item.unit_price,
      })) || [];

      return itemsData;
    } catch (err: any) {
      toast({
        title: "Error Loading Items",
        description: err.message,
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Create a new product interest
  const createInterest = useCallback(async (
    interest: Omit<LeadProductInterest, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setIsLoading(true);

      const { data, error: insertError } = await supabase
        .from('lead_product_interests')
        .insert([interest])
        .select()
        .single();

      if (insertError) throw insertError;

      setInterests(prev => [data, ...prev]);

      toast({
        title: "Product Interest Added",
        description: "Successfully added product category interest.",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error Adding Interest",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update an existing product interest
  const updateInterest = useCallback(async (id: string, updates: Partial<LeadProductInterest>) => {
    try {
      setIsLoading(true);

      const { data, error: updateError } = await supabase
        .from('lead_product_interests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setInterests(prev => prev.map(interest => 
        interest.id === id ? { ...interest, ...data } : interest
      ));

      toast({
        title: "Interest Updated",
        description: "Product interest updated successfully.",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error Updating Interest",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Delete a product interest
  const deleteInterest = useCallback(async (id: string) => {
    try {
      setIsLoading(true);

      const { error: deleteError } = await supabase
        .from('lead_product_interests')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setInterests(prev => prev.filter(interest => interest.id !== id));

      toast({
        title: "Interest Deleted",
        description: "Product interest removed successfully.",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error Deleting Interest",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load categories on hook initialization
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    interests,
    categories,
    categoryPerformance,
    isLoading,
    error,
    createInterest,
    updateInterest,
    deleteInterest,
    loadInterestsForLead,
    loadCategoryPerformance,
    getItemsForCategory,
  };
};