import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { MonthlyTurnover } from '@/components/dashboard/MonthlyTurnoverTable';
import { useAuthStore } from '@/stores/authStore';

export const useTurnoverData = (
  fromDate: Date, 
  toDate: Date, 
  salespersonCode?: string
) => {
  const { profile, isAdmin } = useAuthStore();
  
  const fetchMonthlyTurnover = async (): Promise<MonthlyTurnover[]> => {
    const filterBySalesperson = isAdmin 
      ? Boolean(salespersonCode)
      : true;
    
    const effectiveSalespersonCode = isAdmin && salespersonCode 
      ? salespersonCode 
      : profile?.spp_code || '';
    
    // Fix timezone issue: Send date-only strings instead of timezone-converted ISO strings
    const fromDateStr = format(startOfMonth(fromDate), 'yyyy-MM-dd');
    const toDateStr = format(endOfMonth(toDate), 'yyyy-MM-dd');
    
    console.log('Fetching monthly turnover with params (FIXED TIMEZONE):', {
      from_date: fromDateStr,
      to_date: toDateStr,
      is_admin: isAdmin && !salespersonCode,
      user_spp_code: filterBySalesperson ? effectiveSalespersonCode : '',
      timezone_fix_applied: true
    });

    const { data, error } = await supabase.rpc(
      'get_accurate_monthly_turnover', { 
        from_date: fromDateStr,
        to_date: toDateStr,
        is_admin: isAdmin && !salespersonCode,
        user_spp_code: filterBySalesperson ? effectiveSalespersonCode : ''
      }
    );

    if (error) {
      console.error('Error fetching monthly turnover:', error);
      throw new Error('Failed to fetch monthly turnover');
    }
    
    if (!Array.isArray(data)) {
      console.error('Unexpected data format from RPC:', data);
      return [];
    }
    
    console.log('Monthly turnover raw data:', data);
    
    // Filter to ensure only months within the selected range are included
    const filteredData = data.filter(item => {
      if (!item.month || typeof item.month !== 'string') {
        console.warn('Invalid month data:', item);
        return false;
      }
      try {
        const monthDate = parseISO(`${item.month}-01`);
        if (isNaN(monthDate.getTime())) {
          console.warn('Invalid month date:', item.month);
          return false;
        }
        return monthDate >= startOfMonth(fromDate) && monthDate <= endOfMonth(toDate);
      } catch (error) {
        console.warn('Error parsing month date:', item.month, error);
        return false;
      }
    });
    
    return filteredData.map(item => {
      let displayMonth = item.month;
      try {
        const monthDate = parseISO(`${item.month}-01`);
        if (!isNaN(monthDate.getTime())) {
          displayMonth = format(monthDate, 'MMMM yyyy').replace(/^\w/, c => c.toUpperCase());
        }
      } catch (error) {
        console.warn('Error formatting display month:', item.month, error);
      }
      
      return {
        month: item.month,
        total_turnover: Number(item.total_turnover) || 0,
        total_cost: Number(item.total_cost) || 0,
        total_margin: Number(item.total_margin) || 0,
        margin_percent: Number(item.margin_percent) || 0,
        display_month: displayMonth
      };
    });
  };

  const fetchTotalTurnover = async () => {
    const monthlyData = await fetchMonthlyTurnover();
    
    const totalAmount = monthlyData.reduce((sum, item) => {
      return sum + (Number(item.total_turnover) || 0);
    }, 0);

    return totalAmount;
  };

  const fetchTotalCompanyTurnover = async () => {
    // Fix timezone issue: Send date-only strings
    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    const toDateStr = format(toDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase.rpc(
      'get_accurate_monthly_turnover', {
        from_date: fromDateStr,
        to_date: toDateStr,
        is_admin: true,
        user_spp_code: ''
      }
    );
    
    if (error) {
      console.error('Error fetching company turnover:', error);
      throw new Error('Failed to fetch company turnover');
    }
    
    if (!Array.isArray(data)) {
      console.error('Unexpected data format from RPC:', data);
      return 0;
    }
    
    return data.reduce((sum, item) => {
      return sum + (Number(item.total_turnover) || 0);
    }, 0);
  };

  const fetchLastTransactionDate = async () => {
    let query = supabase
      .from('consolidated_sales')
      .select('posting_date')
      .order('posting_date', { ascending: false })
      .limit(1);
    
    if (isAdmin && salespersonCode) {
      query = query.eq('salesperson_code', salespersonCode);
    }
    else if (!isAdmin && profile?.spp_code) {
      query = query.eq('salesperson_code', profile.spp_code);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Error fetching last transaction date:', error);
      throw new Error('Failed to fetch last transaction date');
    }
    
    if (!data?.posting_date) return null;
    
    try {
      const date = new Date(data.posting_date);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.warn('Error parsing posting_date:', data.posting_date, error);
      return null;
    }
  };

  const fetchLastSalesDate = async () => {
    let query = supabase
      .from('salesdata')
      .select('posting_date')
      .order('posting_date', { ascending: false })
      .limit(1);
    
    if (isAdmin && salespersonCode) {
      query = query.eq('salesperson_code', salespersonCode);
    }
    else if (!isAdmin && profile?.spp_code) {
      query = query.eq('salesperson_code', profile.spp_code);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Error fetching last sales date:', error);
      throw new Error('Failed to fetch last sales date');
    }
    
    console.log('Last sales date data:', data);
    
    if (!data?.posting_date) {
      return null;
    }
    
    // Make sure we handle the date correctly, regardless of format
    const dateStr = data.posting_date;
    
    try {
      // Log the input date string and the resulting date object for debugging
      const parsedDate = typeof dateStr === 'string' 
        ? parseISO(dateStr) 
        : new Date(dateStr);
      
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid sales posting_date:', dateStr);
        return null;
      }
      
      console.log('Parsed last sales date:', {
        input: dateStr,
        parsed: parsedDate,
        formatted: format(parsedDate, 'yyyy-MM-dd')
      });
      
      return parsedDate;
    } catch (error) {
      console.warn('Error parsing sales posting_date:', dateStr, error);
      return null;
    }
  };

  const fetchLastCreditMemoDate = async () => {
    let query = supabase
      .from('credit_memos')
      .select('posting_date')
      .order('posting_date', { ascending: false })
      .limit(1);
    
    if (isAdmin && salespersonCode) {
      query = query.eq('salesperson_code', salespersonCode);
    }
    else if (!isAdmin && profile?.spp_code) {
      query = query.eq('salesperson_code', profile.spp_code);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Error fetching last credit memo date:', error);
      throw new Error('Failed to fetch last credit memo date');
    }
    
    if (!data?.posting_date) {
      return null;
    }
    
    // Ensure correct date parsing for credit memo dates too
    const dateStr = data.posting_date;
    
    try {
      const parsedDate = typeof dateStr === 'string' 
        ? parseISO(dateStr) 
        : new Date(dateStr);
      
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid credit memo posting_date:', dateStr);
        return null;
      }
      
      return parsedDate;
    } catch (error) {
      console.warn('Error parsing credit memo posting_date:', dateStr, error);
      return null;
    }
  };

  const { 
    data: lastSalesDate,
    isLoading: isLoadingLastSales,
    error: lastSalesError
  } = useQuery({
    queryKey: ['lastSalesDate', isAdmin, profile?.spp_code, salespersonCode],
    queryFn: fetchLastSalesDate
  });

  const { 
    data: lastCreditMemoDate,
    isLoading: isLoadingLastCreditMemo,
    error: lastCreditMemoError
  } = useQuery({
    queryKey: ['lastCreditMemoDate', isAdmin, profile?.spp_code, salespersonCode],
    queryFn: fetchLastCreditMemoDate
  });

  const { 
    data: totalTurnover, 
    isLoading: isLoadingTotal, 
    error: totalError 
  } = useQuery({
    queryKey: ['totalTurnover', fromDate.toISOString(), toDate.toISOString(), isAdmin, profile?.spp_code, salespersonCode],
    queryFn: fetchTotalTurnover
  });

  const { 
    data: monthlyTurnover, 
    isLoading: isLoadingMonthly, 
    error: monthlyError 
  } = useQuery({
    queryKey: ['monthlyTurnover', fromDate.toISOString(), toDate.toISOString(), isAdmin, profile?.spp_code, salespersonCode],
    queryFn: fetchMonthlyTurnover
  });

  const {
    data: totalCompanyTurnover,
    isLoading: isLoadingCompanyTotal,
    error: companyTotalError
  } = useQuery({
    queryKey: ['totalCompanyTurnover', fromDate.toISOString(), toDate.toISOString()],
    queryFn: fetchTotalCompanyTurnover,
    enabled: true
  });

  const {
    data: lastTransactionDate,
    isLoading: isLoadingLastTransaction,
    error: lastTransactionError
  } = useQuery({
    queryKey: ['lastTransactionDate', isAdmin, profile?.spp_code, salespersonCode],
    queryFn: fetchLastTransactionDate
  });

  return {
    totalTurnover,
    isLoadingTotal,
    totalError,
    monthlyTurnover,
    isLoadingMonthly,
    monthlyError,
    lastTransactionDate,
    isLoadingLastTransaction,
    lastTransactionError,
    totalCompanyTurnover,
    isLoadingCompanyTotal,
    companyTotalError,
    lastSalesDate,
    isLoadingLastSales,
    lastSalesError,
    lastCreditMemoDate,
    isLoadingLastCreditMemo,
    lastCreditMemoError
  };
};
