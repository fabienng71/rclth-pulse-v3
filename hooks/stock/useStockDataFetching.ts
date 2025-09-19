import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockItem {
  item_code: string;
  description: string | null;
  posting_group: string | null;
  quantity: number;
  adjusted_quantity: number;
  category_description?: string | null;
  base_unit_code: string | null;
  unit_price: number | null;
  stock_value: number;
  last_month_consumption: number;
  days_of_stock: number;
  stock_status: 'critical' | 'low' | 'normal' | 'unknown';
  vendor_code: string | null;
  vendor_name: string | null;
  brand: string | null;
  attribut_1: string | null;
  pricelist: boolean | null;
  synced_at: string | null;
}

export const useStockDataFetching = (debouncedSearchTerm: string) => {
  return useQuery({
    queryKey: ['stockData', debouncedSearchTerm],
    queryFn: async () => {
      // First, get all items with their categories and prices, including new synchronized fields
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('item_code, description, posting_group, base_unit_code, unit_price, vendor_code, brand, attribut_1, pricelist');
        
      if (itemsError) {
        console.error('Items query error:', itemsError);
        throw new Error(`Failed to fetch items data: ${itemsError.message}`);
      }
      
      // Then get stock quantities with adjust field and synchronized fields
      const { data: stockQuantities, error: stockError } = await supabase
        .from('stock_onhands')
        .select('item_code, quantity, adjust, brand, attribut_1, pricelist, synced_at');
        
      if (stockError) {
        console.error('Stock quantities query error:', stockError);
        throw new Error(`Failed to fetch stock data: ${stockError.message}`);
      }
      
      // Get categories for descriptions
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('posting_group, description');
        
      if (categoriesError) {
        console.error('Categories query error:', categoriesError);
        throw new Error(`Failed to fetch categories data: ${categoriesError.message}`);
      }

      // Get vendors for vendor names
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('vendor_code, vendor_name');
        
      if (vendorsError) {
        console.error('Vendors query error:', vendorsError);
        throw new Error(`Failed to fetch vendors data: ${vendorsError.message}`);
      }
      
      // Create maps for lookups with null safety
      const categoryMap = (categories || []).reduce((acc: Record<string, string>, category) => {
        if (category.posting_group && category.description) {
          acc[category.posting_group] = category.description;
        }
        return acc;
      }, {});
      
      const stockMap = (stockQuantities || []).reduce((acc: Record<string, { 
        quantity: number; 
        adjust: number; 
        brand: string | null; 
        attribut_1: string | null; 
        pricelist: boolean | null;
        synced_at: string | null;
      }>, stock) => {
        if (stock.item_code) {
          acc[stock.item_code] = {
            quantity: stock.quantity ?? 0,
            adjust: stock.adjust ?? 0,
            brand: stock.brand,
            attribut_1: stock.attribut_1,
            pricelist: stock.pricelist,
            synced_at: stock.synced_at
          };
        }
        return acc;
      }, {});

      const vendorMap = (vendors || []).reduce((acc: Record<string, string>, vendor) => {
        if (vendor.vendor_code && vendor.vendor_name) {
          acc[vendor.vendor_code] = vendor.vendor_name;
        }
        return acc;
      }, {});
      
      // Combine the data with enhanced fields
      const combinedData = (items || []).map((item) => {
        const stockInfo = stockMap[item.item_code] || { 
          quantity: 0, 
          adjust: 0, 
          brand: null, 
          attribut_1: null, 
          pricelist: null,
          synced_at: null
        };
        const rawQuantity = stockInfo.quantity;
        const adjustQuantity = stockInfo.adjust;
        const adjustedQuantity = Math.max(0, rawQuantity - adjustQuantity);
        
        return {
          ...item,
          quantity: rawQuantity,
          adjusted_quantity: adjustedQuantity,
          category_description: item.posting_group ? categoryMap[item.posting_group] : null,
          vendor_name: item.vendor_code ? vendorMap[item.vendor_code] : null,
          stock_value: adjustedQuantity * (item.unit_price || 0),
          last_month_consumption: 0,
          days_of_stock: 0,
          stock_status: 'unknown' as const,
          brand: stockInfo.brand !== null ? stockInfo.brand : item.brand,
          attribut_1: stockInfo.attribut_1 !== null ? stockInfo.attribut_1 : item.attribut_1,
          pricelist: stockInfo.pricelist !== null ? stockInfo.pricelist : item.pricelist,
          synced_at: stockInfo.synced_at
        };
      });
      
      return combinedData;
    }
  });
};