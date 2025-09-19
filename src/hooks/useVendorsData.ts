
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';

export interface Vendor {
  vendor_code: string;
  vendor_name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  payment_terms?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorFormData {
  vendor_code: string;
  vendor_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  payment_terms: string;
  active: boolean;
}

export const useVendorsData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendorsData', debouncedSearchTerm],
    queryFn: async () => {
      console.log('Fetching vendors data from vendors table');
      
      let query = supabase
        .from('vendors')
        .select('*')
        .order('vendor_name', { ascending: true });

      // Apply search filter if provided
      if (debouncedSearchTerm) {
        query = query.or(`vendor_code.ilike.%${debouncedSearchTerm}%,vendor_name.ilike.%${debouncedSearchTerm}%`);
      }

      const { data: vendorsData, error: vendorsError } = await query;

      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError);
        throw vendorsError;
      }

      const vendors: Vendor[] = (vendorsData || []).map(vendor => ({
        vendor_code: vendor.vendor_code || '',
        vendor_name: vendor.vendor_name || vendor.vendor_code || 'Unknown Vendor',
        contact_email: vendor.contact_email || '',
        contact_phone: vendor.contact_phone || '',
        address: vendor.address || '',
        city: vendor.city || '',
        country: vendor.country || '',
        payment_terms: vendor.payment_terms || '',
        active: vendor.active !== false, // Default to true if null/undefined
        created_at: vendor.created_at,
        updated_at: vendor.updated_at
      }));

      console.log(`Found ${vendors.length} vendors`);
      return vendors;
    }
  });

  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: VendorFormData) => {
      console.log('Creating vendor:', vendorData);
      
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single();

      if (error) {
        console.error('Error creating vendor:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorsData'] });
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    },
    onError: (error) => {
      console.error('Create vendor error:', error);
      toast({
        title: "Error",
        description: "Failed to create vendor. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: async ({ vendorCode, vendorData }: { vendorCode: string; vendorData: Partial<VendorFormData> }) => {
      console.log('Updating vendor:', vendorCode, vendorData);
      
      const { data, error } = await supabase
        .from('vendors')
        .update(vendorData)
        .eq('vendor_code', vendorCode)
        .select()
        .single();

      if (error) {
        console.error('Error updating vendor:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorsData'] });
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update vendor error:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: async (vendorCode: string) => {
      console.log('Deleting vendor:', vendorCode);
      
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('vendor_code', vendorCode);

      if (error) {
        console.error('Error deleting vendor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorsData'] });
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete vendor error:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter vendors based on search term (additional client-side filtering)
  const filteredVendors = data ? data.filter(vendor => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      vendor.vendor_code.toLowerCase().includes(searchLower) ||
      (vendor.vendor_name && vendor.vendor_name.toLowerCase().includes(searchLower))
    );
  }) : [];
  
  return {
    vendors: data || [],
    filteredVendors,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    createVendor: createVendorMutation.mutate,
    updateVendor: updateVendorMutation.mutate,
    deleteVendor: deleteVendorMutation.mutate,
    isCreating: createVendorMutation.isPending,
    isUpdating: updateVendorMutation.isPending,
    isDeleting: deleteVendorMutation.isPending,
  };
};
