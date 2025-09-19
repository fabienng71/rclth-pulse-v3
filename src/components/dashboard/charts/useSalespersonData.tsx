
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SalespersonData, MonthlyTurnover } from "./types";
import { format } from "date-fns";

export const useSalespersonData = (
  isAdmin: boolean, 
  monthlyTurnover: MonthlyTurnover[] | undefined
) => {
  const [salespersonData, setSalespersonData] = useState<SalespersonData[]>([]);
  const [isLoadingSalespersons, setIsLoadingSalespersons] = useState<boolean>(false);

  // Fetch data for each salesperson when admin is logged in
  useEffect(() => {
    const fetchSalespersonTurnover = async () => {
      if (!isAdmin || !monthlyTurnover) return;
      
      try {
        setIsLoadingSalespersons(true);
        
        // First, get the list of salespersons
        const { data: salespersonsData, error: salespersonsError } = await supabase
          .from('salespersons')
          .select('spp_code, spp_name')
          .order('spp_name');
        
        if (salespersonsError) {
          console.error('Error fetching salespersons:', salespersonsError);
          return;
        }

        // Extract the date range from monthly turnover to match the same period
        const months = monthlyTurnover.map(item => item.month);
        
        // Get earliest and latest months from the data
        const sortedMonths = [...months].sort();
        const fromMonth = sortedMonths[0];
        const toMonth = sortedMonths[sortedMonths.length - 1];

        if (!fromMonth || !toMonth) {
          console.error('Could not determine date range from monthly turnover data');
          setIsLoadingSalespersons(false);
          return;
        }

        // Convert month strings to date objects for the RPC call
        const fromDate = new Date(`${fromMonth}-01`);
        const toDate = new Date(`${toMonth}-01`);
        // Set toDate to the end of its month
        toDate.setMonth(toDate.getMonth() + 1);
        toDate.setDate(0);
        
        console.log('Fetching salesperson data from', fromDate, 'to', toDate);
        
        // For each salesperson, get their turnover data
        const salespersonResults: SalespersonData[] = [];
        
        for (const salesperson of salespersonsData || []) {
          // Get monthly data for this salesperson
          const { data: turnoverData, error: turnoverError } = await supabase.rpc(
            'get_filtered_monthly_turnover' as any, 
            { 
              from_date: fromDate.toISOString(),
              to_date: toDate.toISOString(),
              is_admin: false, 
              user_spp_code: salesperson.spp_code
            }
          );
          
          if (turnoverError) {
            console.error('Error fetching turnover for salesperson:', turnoverError);
            continue;
          }

          // Format the data with the full month string to ensure proper matching
          const formattedData = turnoverData.map((item: any) => ({
            month: item.month, // Keep full YYYY-MM format
            turnover: Number(item.total_turnover)
          }));
          
          salespersonResults.push({
            spp_code: salesperson.spp_code,
            spp_name: salesperson.spp_name,
            data: formattedData
          });
        }
        
        setSalespersonData(salespersonResults);
      } catch (err) {
        console.error("Error fetching salesperson data:", err);
      } finally {
        setIsLoadingSalespersons(false);
      }
    };
    
    fetchSalespersonTurnover();
  }, [isAdmin, monthlyTurnover]);

  return { salespersonData, isLoadingSalespersons };
};
