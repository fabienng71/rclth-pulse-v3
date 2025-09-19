
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface ClearanceItem {
  id: string;
  item_code: string;
  description: string | null;
  uom: string | null;
  quantity: number;
  status: string | null;
  expiration_date: string | null;
  note: string | null;
  clearance_price: number | null;
  is_done: boolean;
  vendor: string | null; // Add vendor property
}

// Function to calculate status based on expiration date
const calculateStatus = (expirationDate: string | null): string => {
  if (!expirationDate) return 'Unknown';
  
  const today = new Date();
  const expiration = new Date(expirationDate);
  const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiration <= 30) return 'Critical';
  if (daysUntilExpiration <= 60) return 'Warning';
  if (daysUntilExpiration <= 90) return 'Normal';
  return 'Good';
};

export const useClearanceData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ClearanceItem>('item_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: clearanceData, isLoading, error, refetch } = useQuery({
    queryKey: ['clearanceData', debouncedSearchTerm, sortField, sortDirection],
    queryFn: async () => {
      console.log('Fetching clearance data from Supabase');
      
      let query = supabase
        .from('clearance')
        .select('uuid_id, item_code, description, uom, quantity, expiration_date, note, clearance_price, is_done, vendor'); // Add vendor to select

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(
          `item_code.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`
        );
      }

      // Apply sorting - use the correct column names
      const dbSortField = sortField === 'expiration_date' ? 'expiration_date' : 
                         sortField === 'clearance_price' ? 'clearance_price' : sortField;
      query = query.order(dbSortField, { ascending: sortDirection === 'asc' });

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching clearance data:', error);
        throw new Error('Failed to fetch clearance data');
      }
      
      // Transform the data and calculate status dynamically
      const transformedData = data?.map((item, index) => {
        // Use the new uuid_id as the primary key
        const uniqueId = item.uuid_id || `clearance-${item.item_code}-${index}`;
        
        return {
          id: uniqueId,
          item_code: item.item_code,
          description: item.description,
          uom: item.uom,
          quantity: item.quantity,
          status: calculateStatus(item.expiration_date), // Calculate status dynamically
          expiration_date: item.expiration_date, // Use correct column name
          note: item.note,
          clearance_price: item.clearance_price, // Use correct column name
          is_done: item.is_done || false,
          vendor: item.vendor // Add vendor to transformed data
        };
      }) || [];
      
      console.log(`Fetched ${transformedData.length} clearance items`);
      console.log('Sample transformed item:', transformedData[0]); // Debug log
      
      // Verify all IDs are unique
      const ids = transformedData.map(item => item.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.error('Duplicate IDs detected in clearance data:', ids);
      }
      
      return transformedData;
    }
  });

  const handleSort = (field: keyof ClearanceItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    items: clearanceData || [],
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort
  };
};
