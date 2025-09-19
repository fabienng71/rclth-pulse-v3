
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMonthDateRange } from '@/components/reports/credit-memo/utils/dateUtils';

interface CreditMemo {
  id: string;
  document_no: string;
  posting_date: string;
  customer_code: string;
  customer_name: string;
  amount: number;
  amount_including_vat: number;
  item_code: string;
  quantity: number;
}

export const useCreditMemoData = (selectedMonth: string) => {
  const [creditMemos, setCreditMemos] = useState<CreditMemo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<CreditMemo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch credit memos data
  useEffect(() => {
    const fetchCreditMemos = async () => {
      setLoading(true);
      
      if (!selectedMonth) {
        setLoading(false);
        return;
      }
      
      try {
        const { startDate, endDate } = getMonthDateRange(selectedMonth);
        
        const { data, error } = await supabase
          .from('credit_memos')
          .select('*')
          .gte('posting_date', startDate.toISOString())
          .lte('posting_date', endDate.toISOString())
          .order('posting_date', { ascending: false });
          
        if (error) throw error;
        
        setCreditMemos(data || []);
        setFilteredMemos(data || []);
      } catch (error) {
        console.error('Error fetching credit memos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreditMemos();
  }, [selectedMonth]);

  return { creditMemos, filteredMemos, setFilteredMemos, loading };
};
