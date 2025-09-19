
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLastMonthConsumption } from '@/hooks/useLastMonthConsumption';

export interface VendorStockItem {
  item_code: string;
  description: string;
  base_unit_code: string;
  vendor_code: string;
  current_stock: number;
  forecast_quantity?: number;
  notes?: string;
  last_month_consumption?: number;
}

export const useVendorStockItems = (vendorCode: string) => {
  const [items, setItems] = useState<VendorStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorCode) {
      setItems([]);
      return;
    }

    const fetchVendorStockItems = async () => {
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

        if (!itemsData || itemsData.length === 0) {
          setItems([]);
          return;
        }

        // Fetch stock data for all items
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
        const transformedItems: VendorStockItem[] = itemsData.map(item => ({
          item_code: item.item_code,
          description: item.description || '',
          base_unit_code: item.base_unit_code || '',
          vendor_code: item.vendor_code,
          current_stock: stockMap.get(item.item_code) || 0,
          forecast_quantity: 0,
          notes: '',
          last_month_consumption: 0
        }));

        setItems(transformedItems);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching vendor stock items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorStockItems();
  }, [vendorCode]);

  // Get item codes for last month consumption hook
  const itemCodes = items.map(item => item.item_code);
  
  // Fetch last month consumption data
  const { data: lastMonthData } = useLastMonthConsumption(itemCodes);

  // Update items with last month consumption when data is available
  useEffect(() => {
    if (lastMonthData && lastMonthData.length > 0) {
      setItems(prevItems => 
        prevItems.map(item => {
          const consumptionData = lastMonthData.find(data => data.item_code === item.item_code);
          return {
            ...item,
            last_month_consumption: consumptionData?.last_month_consumption || 0
          };
        })
      );
    }
  }, [lastMonthData]);

  return { items, loading, error, setItems };
};
