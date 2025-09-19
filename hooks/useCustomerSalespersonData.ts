import { useMemo } from 'react';
import { useProfilesList } from './useProfilesList';
import { CustomerWithAnalytics } from './useCustomerReportEnhanced';

export interface CustomerWithSalesperson {
  customer: CustomerWithAnalytics;
  salesperson: {
    code: string | null;
    name: string | null;
    email: string | null;
  };
}

export const useCustomerSalespersonData = (customers: CustomerWithAnalytics[]) => {
  const { data: profiles, isLoading: profilesLoading } = useProfilesList();

  const customersWithSalespeople = useMemo(() => {
    if (!customers || profilesLoading) {
      return [];
    }

    return customers.map(customer => {
      const salespersonCode = customer.salesperson_code;
      
      // Find the profile for this salesperson code
      const salespersonProfile = profiles?.find(profile => 
        profile.spp_code === salespersonCode
      );

      return {
        customer,
        salesperson: {
          code: salespersonCode,
          name: salespersonProfile?.full_name || null,
          email: salespersonProfile?.email || null,
        }
      } as CustomerWithSalesperson;
    });
  }, [customers, profiles, profilesLoading]);

  // Group customers by salesperson for better organization
  const customersBySalesperson = useMemo(() => {
    const groups: { [key: string]: CustomerWithSalesperson[] } = {};
    
    customersWithSalespeople.forEach(item => {
      const key = item.salesperson.code || 'unassigned';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return groups;
  }, [customersWithSalespeople]);

  return {
    customersWithSalespeople,
    customersBySalesperson,
    isLoading: profilesLoading,
    totalCustomers: customers.length,
    totalSalespeople: Object.keys(customersBySalesperson).length,
  };
};