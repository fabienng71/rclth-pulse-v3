
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCellNumeric } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomerReport } from '@/hooks/useCustomerReport';
import { useAuthStore } from '@/stores/authStore';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import ChannelFilter from '@/components/reports/channel/ChannelFilter';
import { FinancialData, PermissionGate } from '@/components/permissions/PermissionGate';

const CustomerReport = () => {
  const { isAdmin } = useAuthStore();
  const [salespersonCode, setSalespersonCode] = useState<string>("all");
  const [channelCode, setChannelCode] = useState<string | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const { 
    customers,
    isLoading,
    searchTerm,
    setSearchTerm,
    error
  } = useCustomerReport(salespersonCode, channelCode);

  const handleBackClick = () => {
    navigate('/reports');
  };

  const { sortField, sortDirection, handleSort } = useSortableTable<string>("customer_code");

  const sortedCustomers = [...customers].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch(sortField) {
      case 'customer_code':
        return a.customer_code.localeCompare(b.customer_code) * direction;
      case 'customer_name':
        return a.customer_name.localeCompare(b.customer_name) * direction;
      case 'search_name':
        const aSearch = a.search_name || '';
        const bSearch = b.search_name || '';
        return aSearch.localeCompare(bSearch) * direction;
      case 'total_turnover':
        return (a.total_turnover - b.total_turnover) * direction;
      default:
        return 0;
    }
  });

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
      setSelectedCustomers(customers.map(customer => customer.customer_code));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleViewDetails = () => {
    navigate('/reports/customers/details', { 
      state: { selectedCustomers } 
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
        customer_name: customer.customer_name,
        search_name: customer.search_name || '',
        salesperson_code: customer.salesperson_code || '',
        total_turnover: customer.total_turnover
      }));
    
    if (exportData.length === 0) {
      return;
    }
    
    const csv = [
      'Customer Code,Customer Name,Search Name,Salesperson Code,Total Turnover',
      ...exportData.map(row => 
        `${row.customer_code},"${row.customer_name}","${row.search_name}","${row.salesperson_code}",${row.total_turnover}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChannelChange = (channel: string | null) => {
    setChannelCode(channel);
    // Reset selected customers when changing channel filter
    setSelectedCustomers([]);
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBackClick} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Customer Report</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full">
                <div className="space-y-2">
                  <label htmlFor="customer-search" className="text-sm font-medium">Search</label>
                  <Input
                    id="customer-search"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <ChannelFilter 
                selectedChannel={channelCode}
                onChannelChange={handleChannelChange}
              />

              {isAdmin && (
                <div className="w-full">
                  <SalespersonFilter
                    value={salespersonCode}
                    onChange={setSalespersonCode}
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing customers for: 
                {channelCode && (
                  <Badge variant="outline" className="ml-2 mr-2">
                    Channel: {channelCode}
                  </Badge>
                )}
                {salespersonCode !== "all" && isAdmin && (
                  <Badge variant="outline" className="ml-2 mr-2">
                    Salesperson: {salespersonCode}
                  </Badge>
                )}
                {salespersonCode === "all" && isAdmin && (
                  <Badge variant="outline" className="ml-2 mr-2">
                    All Salespeople
                  </Badge>
                )}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({customers.length} customers)
                </span>
              </span>
            </div>

            {error ? (
              <div className="border rounded-lg p-6 bg-destructive/10 border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-destructive">Error Loading Customers</h3>
                </div>
                <p className="text-sm text-destructive/80 mb-4">
                  {error.message || 'An unexpected error occurred while loading customer data.'}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/reports')}
                  >
                    Back to Reports
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedCustomers.length} of {customers.length} customers selected
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      disabled={selectedCustomers.length === 0 || isLoading}
                      onClick={handleViewTurnover}
                      variant="outline"
                      size="sm"
                    >
                      Customer Turnover
                    </Button>
                    <Button 
                      disabled={selectedCustomers.length === 0 || isLoading}
                      onClick={handleViewDetails}
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </Button>
                    <PermissionGate permission="export_financial_data">
                      <Button 
                        disabled={selectedCustomers.length === 0 || isLoading}
                        onClick={handleExportCustomers}
                        variant="outline"
                        size="sm"
                      >
                        Export CSV
                      </Button>
                    </PermissionGate>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={customers.length > 0 && selectedCustomers.length === customers.length}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            aria-label="Select all customers"
                          />
                        </TableHead>
                        <SortableTableHeader 
                          field="customer_code" 
                          currentSortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Customer Code
                        </SortableTableHeader>
                        <SortableTableHeader 
                          field="customer_name" 
                          currentSortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Customer Name
                        </SortableTableHeader>
                        <SortableTableHeader 
                          field="search_name" 
                          currentSortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Search Name
                        </SortableTableHeader>
                        <SortableTableHeader 
                          field="total_turnover" 
                          currentSortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                          align="right"
                        >
                          Total Turnover
                        </SortableTableHeader>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(10).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : sortedCustomers && sortedCustomers.length > 0 ? (
                        sortedCustomers.map((customer) => (
                          <TableRow key={customer.customer_code}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedCustomers.includes(customer.customer_code)}
                                onCheckedChange={() => handleCustomerSelect(customer.customer_code)}
                                aria-label={`Select ${customer.customer_name}`}
                              />
                            </TableCell>
                            <TableCell>{customer.customer_code}</TableCell>
                            <TableCell>{customer.customer_name}</TableCell>
                            <TableCell>{customer.search_name || '-'}</TableCell>
                            <TableCell className="text-right">
                              <FinancialData 
                                amount={customer.total_turnover}
                                permission="view_turnover_amounts"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            {customers ? 'No customers found' : 'Failed to load customers'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CustomerReport;
