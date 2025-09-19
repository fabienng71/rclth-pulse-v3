
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useCustomersWithAnalytics } from '@/hooks/useCustomersWithAnalytics';
import { useCustomerDataSync } from '@/hooks/useCustomerDataSync';
import { useSortableTable } from '@/hooks/useSortableTable';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { CustomersHeader } from '@/components/crm/customers/CustomersHeader';
import { CustomersSearchBar } from '@/components/crm/customers/CustomersSearchBar';
import { CustomersTable } from '@/components/crm/customers/CustomersTable';
import { CustomersStats } from '@/components/crm/customers/CustomersStats';

type SortField = 'customer_name' | 'search_name' | 'total_turnover' | 'last_transaction_date' | 'transaction_frequency';

const CustomersList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('all');
  const [hideZeroTurnover, setHideZeroTurnover] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('total_turnover');
  const { customers, isLoading, refetch } = useCustomersWithAnalytics(debouncedSearchQuery, selectedSalesperson);
  const { syncStatus, autoSyncCustomers } = useCustomerDataSync();

  // Use custom filter hook for client-side filtering
  const { filteredCustomers } = useCustomerFilters(customers);

  // Apply hide zero turnover filter
  const finalFilteredCustomers = hideZeroTurnover 
    ? filteredCustomers.filter(customer => customer.total_turnover > 0)
    : filteredCustomers;

  // Auto-sync missing customers when component mounts and sync status is available
  useEffect(() => {
    if (syncStatus && !syncStatus.isInSync && syncStatus.missingCustomers.length > 0 && syncStatus.missingCustomers.length <= 10) {
      console.log('Auto-syncing missing customers...');
      autoSyncCustomers();
    }
  }, [syncStatus, autoSyncCustomers]);

  const handleDataRefresh = () => {
    refetch();
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Navigation />
      <main className="container py-6 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col">
          <CustomersHeader 
            customers={finalFilteredCustomers} 
            onCustomerCreated={handleDataRefresh}
          />
          
          <CustomersStats customers={finalFilteredCustomers} />
          
          <CustomersSearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hideZeroTurnover={hideZeroTurnover}
            onHideZeroTurnoverChange={setHideZeroTurnover}
            selectedSalesperson={selectedSalesperson}
            onSalespersonChange={setSelectedSalesperson}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-2xl mb-2">🏢</div>
                <p className="text-muted-foreground">Loading customers from salesdata...</p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <CustomersTable 
                customers={finalFilteredCustomers}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onDataRefresh={handleDataRefresh}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CustomersList;
