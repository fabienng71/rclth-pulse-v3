import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { extractSortedMonths } from '@/components/reports/monthly-data';
import { useCustomerPurchaseData } from '@/hooks/useCustomerPurchaseData';
import { EmptyCustomerSelection } from '@/components/reports/customer-details/EmptyCustomerSelection';
import { PurchaseDataTable } from '@/components/reports/customer-details/PurchaseDataTable';
import { CustomerInfoSection } from '@/components/reports/customer-details/CustomerInfoSection';
import { CustomerWithAnalytics } from '@/hooks/useCustomerReportEnhanced';

const CustomerDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedCustomers = location.state?.selectedCustomers || [];
  const selectedCustomerObjects: CustomerWithAnalytics[] = location.state?.selectedCustomerObjects || [];
  
  const [fromDate, setFromDate] = useState(subMonths(startOfMonth(new Date()), 5));
  const [toDate, setToDate] = useState(endOfMonth(new Date()));
  const [showAmount, setShowAmount] = useState(false);
  
  const { purchaseData, isLoading, error } = useCustomerPurchaseData(
    selectedCustomers,
    fromDate,
    toDate,
    showAmount
  );
  
  const handleBackClick = () => {
    navigate('/reports/customers');
  };
  
  if (selectedCustomers.length === 0) {
    return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
        <main className="container py-6">
          <EmptyCustomerSelection />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackClick} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Customer Details</h1>
        </div>
        
        {/* Customer Information Section */}
        {selectedCustomerObjects.length > 0 && (
          <CustomerInfoSection customers={selectedCustomerObjects} />
        )}
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>
              Purchase History
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedCustomers.length} {selectedCustomers.length === 1 ? 'customer' : 'customers'} selected)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <DateRangeSelector
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
              />
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">Quantity</span>
                <Switch 
                  checked={showAmount} 
                  onCheckedChange={setShowAmount} 
                  id="amount-toggle"
                />
                <span className="text-sm">Amount</span>
              </div>
            </div>
            
            <PurchaseDataTable
              purchaseData={purchaseData}
              isLoading={isLoading}
              error={error}
              showAmount={showAmount}
              allMonths={extractSortedMonths(purchaseData)}
              grandTotalQuantity={purchaseData.reduce((sum, item) => sum + item.totals.quantity, 0)}
              grandTotalAmount={purchaseData.reduce((sum, item) => sum + item.totals.amount, 0)}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CustomerDetailsPage;
