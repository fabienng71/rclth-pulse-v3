
import { useState, useEffect } from 'react';
import { format, endOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CustomerPurchase } from '@/components/reports/customer-details/types';

export const useCustomerPurchaseData = (
  selectedCustomers: string[],
  fromDate: Date,
  toDate: Date,
  showAmount: boolean
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [purchaseData, setPurchaseData] = useState<CustomerPurchase[]>([]);

  useEffect(() => {
    if (selectedCustomers.length === 0) {
      setIsLoading(false);
      return;
    }
    
    const fetchCustomerPurchases = async () => {
      try {
        setIsLoading(true);
        
        // Format dates ensuring we include the full end date (until 23:59:59)
        const fromDateStr = format(fromDate, 'yyyy-MM-dd');
        const toDateStr = format(endOfDay(toDate), 'yyyy-MM-dd HH:mm:ss');
        
        console.log('Date range:', fromDateStr, 'to', toDateStr);
        
        // Fetch sales data
        const { data: salesData, error } = await supabase
          .from('salesdata')
          .select('item_code, description, base_unit_code, quantity, amount, posting_date, unit_price')
          .in('customer_code', selectedCustomers)
          .gte('posting_date', fromDateStr)
          .lte('posting_date', toDateStr)
          .not('item_code', 'is', null);
          
        if (error) throw error;
        
        // Process sales data by item
        const itemMonthMap = new Map<string, any>();
        const itemCodes: string[] = [];
        
        salesData?.forEach(sale => {
          const month = format(new Date(sale.posting_date!), 'yyyy-MM');
          const itemCode = sale.item_code!;
          
          if (!itemMonthMap.has(itemCode)) {
            itemMonthMap.set(itemCode, {
              item_code: itemCode,
              description: sale.description,
              base_unit_code: sale.base_unit_code,
              month_data: {},
              totals: {
                quantity: 0,
                amount: 0
              },
              margin_percent: null,
              last_unit_price: null,
              cogs_unit: null
            });
            itemCodes.push(itemCode);
          }
          
          const itemData = itemMonthMap.get(itemCode);
          
          if (!itemData.month_data[month]) {
            itemData.month_data[month] = {
              quantity: 0,
              amount: 0
            };
          }
          
          itemData.month_data[month].quantity += sale.quantity || 0;
          itemData.month_data[month].amount += sale.amount || 0;
          
          itemData.totals.quantity += sale.quantity || 0;
          itemData.totals.amount += sale.amount || 0;
          
          // Update last unit price if this is the most recent transaction
          if (sale.unit_price) {
            itemData.last_unit_price = sale.unit_price;
          }
          
          itemMonthMap.set(itemCode, itemData);
        });
        
        // Fetch COGS data for all items
        if (itemCodes.length > 0) {
          const { data: cogsData, error: cogsError } = await supabase
            .from('cogs_master')
            .select('item_code, cogs_unit')
            .in('item_code', itemCodes);
            
          if (cogsError) throw cogsError;
          
          // Update items with COGS data and calculate margins
          cogsData?.forEach(cogs => {
            if (itemMonthMap.has(cogs.item_code)) {
              const itemData = itemMonthMap.get(cogs.item_code);
              itemData.cogs_unit = cogs.cogs_unit;
              
              // Calculate margin percentage based on total sales and total COGS
              if (cogs.cogs_unit && itemData.totals.quantity > 0 && itemData.totals.amount > 0) {
                const totalCogs = cogs.cogs_unit * itemData.totals.quantity;
                const totalSales = itemData.totals.amount;
                
                if (totalSales > 0) {
                  // Margin % = ((Sales - COGS) / Sales) * 100
                  const margin = ((totalSales - totalCogs) / totalSales) * 100;
                  itemData.margin_percent = Number(margin.toFixed(2));
                }
              }
              
              itemMonthMap.set(cogs.item_code, itemData);
            }
          });
        }
        
        // Get the latest transaction for each item to find the latest price
        const promises = itemCodes.map(async (itemCode) => {
          const { data: latestSale } = await supabase
            .from('salesdata')
            .select('unit_price, posting_date')
            .eq('item_code', itemCode)
            .in('customer_code', selectedCustomers)
            .not('unit_price', 'is', null)
            .order('posting_date', { ascending: false })
            .limit(1);
            
          if (latestSale && latestSale.length > 0 && latestSale[0].unit_price) {
            const itemData = itemMonthMap.get(itemCode);
            if (itemData) {
              itemData.last_unit_price = latestSale[0].unit_price;
              itemMonthMap.set(itemCode, itemData);
            }
          }
        });
        
        // Wait for all price lookup queries to complete
        await Promise.all(promises);
        
        const processedData = Array.from(itemMonthMap.values())
          .sort((a, b) => showAmount 
            ? b.totals.amount - a.totals.amount
            : b.totals.quantity - a.totals.quantity
          );
        
        setPurchaseData(processedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching customer purchases:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch customer purchases'));
        toast({
          title: "Error",
          description: "Failed to fetch customer purchase data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerPurchases();
  }, [selectedCustomers, fromDate, toDate, showAmount, toast]);

  return { purchaseData, isLoading, error };
};
