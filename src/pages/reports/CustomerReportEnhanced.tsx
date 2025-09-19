import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useSortableTable } from '@/hooks/useSortableTable';
import { useCustomerReportEnhanced, CustomerReportFilters } from '@/hooks/useCustomerReportEnhanced';
import { 
  CustomerAnalyticsSummary, 
  CustomerFiltersSection, 
  CustomerActionsBar, 
  CustomerDataTable 
} from '@/components/reports/customer-enhanced';

const CustomerReportEnhanced = () => {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  
  // Filter states
  const [filters, setFilters] = useState<CustomerReportFilters>({
    salespersonCode: 'all',
    channelCode: null,
  });
  
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const {
    customers,
    allCustomers,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    analytics,
    refetch,
    getHealthScoreColor,
    getRFMSegmentColor,
    getGrowthTrendIcon
  } = useCustomerReportEnhanced(filters);

  const { sortField, sortDirection, handleSort } = useSortableTable<string>("health_score");

  const sortedCustomers = [...customers].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch(sortField) {
      case 'customer_code':
        return a.customer_code.localeCompare(b.customer_code) * direction;
      case 'customer_name':
        return (a.search_name || a.customer_name).localeCompare(b.search_name || b.customer_name) * direction;
      case 'total_turnover':
        return (a.total_turnover - b.total_turnover) * direction;
      case 'health_score':
        return (a.health_score - b.health_score) * direction;
      case 'recency_days':
        return (a.recency_days - b.recency_days) * direction;
      case 'growth_trend':
        return a.growth_trend.localeCompare(b.growth_trend) * direction;
      default:
        return 0;
    }
  });

  const handleBackClick = () => {
    navigate('/reports');
  };

  const handleFilterChange = (key: keyof CustomerReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset selected customers when filters change
    setSelectedCustomers([]);
  };

  const handleCustomerSelect = (customerCode: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerCode)) {
        return prev.filter(code => code !== customerCode);
      } else {
        return [...prev, customerCode];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(sortedCustomers.map(customer => customer.customer_code));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleViewDetails = () => {
    // Get complete customer objects for selected customer codes
    const selectedCustomerObjects = sortedCustomers.filter(customer => 
      selectedCustomers.includes(customer.customer_code)
    );
    
    navigate('/reports/customers/details', { 
      state: { 
        selectedCustomers,
        selectedCustomerObjects 
      } 
    });
  };
  
  const handleViewTurnover = () => {
    navigate('/reports/customers/turnover', { 
      state: { selectedCustomers } 
    });
  };

  const handleExportCustomers = () => {
    // Export selected customers data
    const exportData = sortedCustomers
      .filter(customer => selectedCustomers.includes(customer.customer_code))
      .map(customer => ({
        customer_code: customer.customer_code,
        customer_name: customer.search_name || customer.customer_name,
        search_name: customer.search_name,
        salesperson_code: customer.salesperson_code,
        total_turnover: customer.total_turnover,
        health_score: customer.health_score,
        rfm_segment: customer.rfm_segment,
        growth_trend: customer.growth_trend,
        is_at_risk: customer.is_at_risk,
        is_new_customer: customer.is_new_customer,
        recency_days: customer.recency_days,
        average_order_value: customer.average_order_value,
        last_transaction_date: customer.last_transaction_date,
        last_activity_date: customer.last_activity_date
      }));
    
    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBackClick} 
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Enhanced Customer Report</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh Data
          </Button>
        </div>
        
        {/* Analytics Summary Cards */}
        <CustomerAnalyticsSummary analytics={analytics} />
        
        {/* Filters Section */}
        <CustomerFiltersSection
          filters={filters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          customers={customers}
          isAdmin={isAdmin}
          error={error}
          isLoading={isLoading}
          refetch={refetch}
          handleFilterChange={handleFilterChange}
        />
        
        {/* Main Content */}
        {!error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <CustomerActionsBar
                selectedCustomers={selectedCustomers}
                totalCustomers={sortedCustomers.length}
                isLoading={isLoading}
                onViewTurnover={handleViewTurnover}
                onViewDetails={handleViewDetails}
                onExportCustomers={handleExportCustomers}
              />
              
              <CustomerDataTable
                sortedCustomers={sortedCustomers}
                selectedCustomers={selectedCustomers}
                isLoading={isLoading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectAll={handleSelectAll}
                onCustomerSelect={handleCustomerSelect}
                getHealthScoreColor={getHealthScoreColor}
                getRFMSegmentColor={getRFMSegmentColor}
                getGrowthTrendIcon={getGrowthTrendIcon}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CustomerReportEnhanced;