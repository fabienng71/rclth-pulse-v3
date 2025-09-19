
import { supabase } from '@/integrations/supabase/client';
import { PriceListItem } from './types';
import { EXCLUDED_VENDOR } from './constants';

export async function fetchPriceListItems(): Promise<PriceListItem[]> {
  console.log('Fetching price list items...');
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .neq('vendor_code', EXCLUDED_VENDOR) // Exclude items from the specified vendor
    .not('pricelist', 'is', false) // Include items where pricelist is either true or null
    .order('posting_group', { ascending: true })
    .order('description', { ascending: true });

  if (error) {
    console.error('Error fetching items:', error);
    throw new Error('Failed to fetch price list items');
  }
  
  console.log(`Found ${data?.length || 0} price list items`);
  return data || [];
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('description', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }

  return data || [];
}

export async function fetchVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*');

  if (error) {
    console.error('Error fetching vendors:', error);
    throw new Error('Failed to fetch vendors');
  }

  return data || [];
}
