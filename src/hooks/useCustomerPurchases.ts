
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface CustomerPurchase {
  customer_code: string;
  customer_name: string | null;
  search_name: string | null;
  month_data: {
    [key: string]: {
      amount: number;
      quantity: number;
    }
  };
  total_amount: number;
  total_quantity: number;
  margin_percent: number | null;
  last_unit_price: number | null;
}

export interface ItemCustomerData {
  item_code: string;
  item_description: string;
  customers: CustomerPurchase[];
  total_customers: number;
  total_quantity: number;
  total_amount: number;
}

export const useCustomerPurchases = (
  itemCodes: string[],
  fromDate: Date,
  toDate: Date
) => {
  const [customerPurchases, setCustomerPurchases] = useState<ItemCustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { profile, isAdmin } = useAuthStore();

  useEffect(() => {
    const fetchCustomerPurchases = async () => {
      if (itemCodes.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First get COGS data for the items
        const { data: cogsData, error: cogsError } = await supabase
          .rpc('get_cogs_data_for_items', { item_codes: itemCodes });
        
        if (cogsError) {
          console.error('Error fetching COGS data:', cogsError);
        }
        
        // Create a map of item_code to cogs_unit for quick lookups
        const cogsMap = new Map<string, number>();
        if (cogsData && Array.isArray(cogsData)) {
          cogsData.forEach((item: any) => {
            if (item.item_code && item.cogs_unit) {
              cogsMap.set(item.item_code, item.cogs_unit);
            }
          });
        }

        // Get item descriptions
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('item_code, description')
          .in('item_code', itemCodes);

        if (itemsError) {
          console.error('Error fetching item descriptions:', itemsError);
        }

        // Create a map of item_code to description
        const itemDescriptionsMap = new Map<string, string>();
        if (itemsData) {
          itemsData.forEach((item) => {
            itemDescriptionsMap.set(item.item_code, item.description || item.item_code);
          });
        }

        let query = supabase
          .from('salesdata')
          .select(`
            customer_code,
            customer_name,
            search_name,
            item_code,
            quantity,
            amount,
            unit_price,
            posting_date
          `)
          .in('item_code', itemCodes)
          .gte('posting_date', fromDate.toISOString())
          .lte('posting_date', toDate.toISOString());
        
        // Apply user filtering for non-admin users
        if (!isAdmin && profile?.spp_code) {
          query = query.eq('salesperson_code', profile.spp_code);
        }
        
        const { data, error } = await query;
        
        if (error) throw new Error(error.message);
        
        if (!data || data.length === 0) {
          setCustomerPurchases([]);
          return;
        }
        
        // Process data to group by item, then by customer
        const itemMap: Record<string, Record<string, CustomerPurchase>> = {};
        
        // Initialize item map
        itemCodes.forEach(itemCode => {
          itemMap[itemCode] = {};
        });
        
        data.forEach(row => {
          const customerCode = row.customer_code || 'unknown';
          const itemCode = row.item_code || 'unknown';
          const quantity = Number(row.quantity || 0);
          const amount = Number(row.amount || 0);
          const unitPrice = Number(row.unit_price || 0);
          const date = new Date(row.posting_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          // Initialize item if not exists
          if (!itemMap[itemCode]) {
            itemMap[itemCode] = {};
          }
          
          // Create customer entry if it doesn't exist for this item
          if (!itemMap[itemCode][customerCode]) {
            itemMap[itemCode][customerCode] = {
              customer_code: customerCode,
              customer_name: row.customer_name || null,
              search_name: row.search_name || null,
              month_data: {},
              total_amount: 0,
              total_quantity: 0,
              margin_percent: null,
              last_unit_price: unitPrice || null
            };
          }
          
          // Initialize month data if it doesn't exist
          if (!itemMap[itemCode][customerCode].month_data[monthKey]) {
            itemMap[itemCode][customerCode].month_data[monthKey] = {
              amount: 0,
              quantity: 0
            };
          }
          
          // Add to totals
          itemMap[itemCode][customerCode].month_data[monthKey].amount += amount;
          itemMap[itemCode][customerCode].month_data[monthKey].quantity += quantity;
          itemMap[itemCode][customerCode].total_amount += amount;
          itemMap[itemCode][customerCode].total_quantity += quantity;
          
          // Update last_unit_price
          itemMap[itemCode][customerCode].last_unit_price = unitPrice || itemMap[itemCode][customerCode].last_unit_price;
          
          // Calculate margin if we have COGS data
          const cogsUnit = cogsMap.get(itemCode);
          if (cogsUnit) {
            const cost = quantity * cogsUnit;
            const margin = amount - cost;
            const marginPercent = amount > 0 ? (margin / amount) * 100 : 0;
            
            itemMap[itemCode][customerCode].margin_percent = itemMap[itemCode][customerCode].margin_percent === null ? 
              marginPercent : 
              ((itemMap[itemCode][customerCode].margin_percent + marginPercent) / 2);
          }
        });
        
        // Convert to array format
        const itemCustomerDataArray: ItemCustomerData[] = Object.entries(itemMap)
          .filter(([itemCode, customers]) => Object.keys(customers).length > 0)
          .map(([itemCode, customers]) => {
            const customerArray = Object.values(customers);
            return {
              item_code: itemCode,
              item_description: itemDescriptionsMap.get(itemCode) || itemCode,
              customers: customerArray,
              total_customers: customerArray.length,
              total_quantity: customerArray.reduce((sum, customer) => sum + customer.total_quantity, 0),
              total_amount: customerArray.reduce((sum, customer) => sum + customer.total_amount, 0)
            };
          });
        
        setCustomerPurchases(itemCustomerDataArray);
      } catch (err: any) {
        setError(err);
        console.error('Error fetching customer purchases:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerPurchases();
  }, [itemCodes, fromDate, toDate, isAdmin, profile?.spp_code]);
  
  return {
    customerPurchases,
    isLoading,
    error
  };
};
