
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ArrowLeft, Info } from 'lucide-react';
import { useCustomerTurnoverData } from '@/hooks/useCustomerTurnoverData';
import { CustomerTurnoverChart } from '@/components/reports/customer-turnover/CustomerTurnoverChart';
import { CustomerTurnoverTable } from '@/components/reports/customer-turnover/CustomerTurnoverTable';
import { EmptyCustomerSelection } from '@/components/reports/customer-details/EmptyCustomerSelection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const CustomerTurnoverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedCustomers = location.state?.selectedCustomers || [];
  
  const [fromDate, setFromDate] = useState(subMonths(startOfMonth(new Date()), 5)); // Last 6 months
  const [toDate, setToDate] = useState(endOfMonth(new Date())); // Until today
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('table');
  const [includeCredits, setIncludeCredits] = useState(true);
  
  const { monthlyData, isLoading, error } = useCustomerTurnoverData(
    selectedCustomers,
    fromDate,
    toDate,
    includeCredits
  );
  
  const handleBackClick = () => {
    navigate('/reports');
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
          <h1 className="text-2xl font-bold md:text-3xl">Customer Turnover</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>
              Monthly Turnover by Customer
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedCustomers.length} {selectedCustomers.length === 1 ? 'customer' : 'customers'} selected)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <DateRangeSelector
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={setFromDate}
                  onToDateChange={setToDate}
                />
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-net-values" 
                    checked={includeCredits} 
                    onCheckedChange={setIncludeCredits} 
                  />
                  <Label htmlFor="show-net-values" className="cursor-pointer">
                    Show Net Values
                  </Label>
                  <div className="relative group ml-1">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div className="absolute z-10 invisible group-hover:visible bg-secondary text-secondary-foreground 
                                  p-2 rounded shadow-lg right-0 w-64 text-xs">
                      When enabled, this shows net turnover (sales minus credit memos). 
                      When disabled, shows gross sales only.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Error loading turnover data: {error.message}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {selectedCustomers.length > 15 && (
                  <Alert variant="warning" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Performance Notice</AlertTitle>
                    <AlertDescription>
                      You've selected {selectedCustomers.length} customers. For best performance, 
                      consider selecting fewer customers at a time.
                    </AlertDescription>
                  </Alert>
                )}
              
                <Tabs 
                  defaultValue="table" 
                  value={activeTab} 
                  onValueChange={(value) => setActiveTab(value as 'chart' | 'table')}
                  className="space-y-4"
                >
                  <TabsList>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                    <TabsTrigger value="chart">Chart View</TabsTrigger>
                  </TabsList>
                  <TabsContent value="table">
                    <CustomerTurnoverTable 
                      data={monthlyData} 
                      isLoading={isLoading} 
                      fromDate={fromDate}
                      toDate={toDate}
                      includeCredits={includeCredits}
                    />
                  </TabsContent>
                  <TabsContent value="chart" className="space-y-4">
                    <CustomerTurnoverChart 
                      data={monthlyData} 
                      isLoading={isLoading}
                      fromDate={fromDate}
                      toDate={toDate}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CustomerTurnoverPage;
