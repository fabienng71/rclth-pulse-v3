
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useItemSalesData } from '@/hooks/useItemSalesData';
import ItemSalesTable from '@/components/reports/ItemSalesTable';
import { useCustomerPurchases } from '@/hooks/useCustomerPurchases';
import { GroupedCustomersByItem } from '@/components/reports/customer-purchases/GroupedCustomersByItem';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CustomerDataSyncButton } from '@/components/reports/sync/CustomerDataSyncButton';
import { useAuthStore } from '@/stores/authStore';
import { ItemSalesSummary } from '@/components/reports/summary/ItemSalesSummary';

const ItemDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuthStore();
  const selectedItems = location.state?.selectedItems || [];
  const [showAmount, setShowAmount] = useState(false);
  const { 
    fromDate, 
    toDate, 
    setFromDate, 
    setToDate,
    monthlyData,
    isLoading,
    error
  } = useItemSalesData(selectedItems);

  // Add customer purchases data hook
  const {
    customerPurchases,
    isLoading: isLoadingCustomers,
    error: customersError
  } = useCustomerPurchases(selectedItems, fromDate, toDate);

  const handleBackToReport = () => {
    navigate('/reports/items');
  };

  if (selectedItems.length === 0) {
    return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
        <main className="container py-6">
          <h1 className="mb-6 text-2xl font-bold md:text-3xl">Item Details</h1>
          <Card>
            <CardContent className="py-6">
              <p>No items selected. Please return to the items report and select items to view details.</p>
              <Button className="mt-4" onClick={() => window.history.back()}>Back to Items</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBackToReport}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Item Details</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <Label htmlFor="quantity-amount-toggle" className={`${!showAmount ? 'font-bold' : 'text-muted-foreground'}`}>
                Quantity
              </Label>
              <Switch
                id="quantity-amount-toggle"
                checked={showAmount}
                onCheckedChange={setShowAmount}
              />
              <Label htmlFor="quantity-amount-toggle" className={`${showAmount ? 'font-bold' : 'text-muted-foreground'}`}>
                Amount
              </Label>
            </div>
            
            {isAdmin && (
              <CustomerDataSyncButton />
            )}
            
            <Button disabled className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Export to XLS
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <DateRangeSelector
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Add the new Summary component here */}
        <ItemSalesSummary 
          monthlyData={monthlyData}
          showAmount={showAmount}
          isLoading={isLoading}
        />

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Sales Data</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-500">Error loading sales data: {error.message}</div>
            ) : (
              <ItemSalesTable
                monthlyData={monthlyData}
                isLoading={isLoading}
                showAmount={showAmount}
                selectedItems={selectedItems}
              />
            )}
          </CardContent>
        </Card>

        {/* Replace CustomerPurchasesTable with GroupedCustomersByItem */}
        {customersError ? (
          <Card>
            <CardContent className="py-6">
              <div className="text-red-500">Error loading customer data: {customersError.message}</div>
            </CardContent>
          </Card>
        ) : (
          <GroupedCustomersByItem
            customerPurchases={customerPurchases}
            selectedItems={selectedItems}
            isLoading={isLoadingCustomers}
            showAmount={showAmount}
          />
        )}
      </main>
    </div>
  );
};

export default ItemDetailsPage;
