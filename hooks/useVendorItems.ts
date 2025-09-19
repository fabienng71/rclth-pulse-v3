
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface VendorItem {
  item_code: string;
  description: string;
  base_unit_code: string;
  vendor_code: string;
  current_stock: number | null;
}

export const useVendorItems = (vendorCode: string) => {
  const [items, setItems] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorCode) {
      setItems([]);
      return;
    }

    const fetchVendorItems = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch items for the vendor
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('item_code, description, base_unit_code, vendor_code')
          .eq('vendor_code', vendorCode)
          .order('item_code');

        if (itemsError) throw itemsError;

        // Fetch stock data separately for all items
        const itemCodes = itemsData.map(item => item.item_code);
        const { data: stockData, error: stockError } = await supabase
          .from('stock_onhands')
          .select('item_code, quantity')
          .in('item_code', itemCodes);

        if (stockError) throw stockError;

        // Create a map of stock quantities by item code
        const stockMap = new Map<string, number>();
        stockData?.forEach(stock => {
          const currentQty = stockMap.get(stock.item_code) || 0;
          stockMap.set(stock.item_code, currentQty + (stock.quantity || 0));
        });

        // Transform the data to include current stock
        const transformedItems: VendorItem[] = (itemsData || []).map(item => ({
          item_code: item.item_code,
          description: item.description || '',
          base_unit_code: item.base_unit_code || '',
          vendor_code: item.vendor_code,
          current_stock: stockMap.get(item.item_code) || 0
        }));

        setItems(transformedItems);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching vendor items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorItems();
  }, [vendorCode]);

  return { items, loading, error };
};
