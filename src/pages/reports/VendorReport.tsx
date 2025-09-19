
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subMonths } from 'date-fns';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { VendorSalesTable } from '@/components/reports/VendorSalesTable';
import { VendorSalesChart } from '@/components/reports/vendor/VendorSalesChart';
import VendorFilter from '@/components/reports/vendor/VendorFilter';
import { useVendorSalesData } from '@/hooks/useVendorSalesData';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VendorReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuthStore();
  
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    return subMonths(date, 6);
  });
  
  const [toDate, setToDate] = useState(() => new Date());
  
  const { 
    vendorSalesData,
    months,
    isLoading 
  } = useVendorSalesData(fromDate, toDate);
  
  const handleGoBack = () => {
    navigate('/reports');
  };
  
  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to view this report.",
      variant: "destructive"
    });
    navigate('/reports');
    return null;
  }

  // Filter data by selected vendor if needed
  const filteredData = selectedVendor 
    ? vendorSalesData.filter(vendor => vendor.vendor_code === selectedVendor) 
    : vendorSalesData;

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleGoBack}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Vendor Sales Report</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Vendor Monthly Sales</CardTitle>
            <CardDescription>
              View monthly sales data for each vendor
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <DateRangeSelector
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={setFromDate}
                  onToDateChange={setToDate}
                />
              </div>
              <div className="md:w-[260px]">
                <VendorFilter
                  selectedVendor={selectedVendor}
                  onVendorChange={setSelectedVendor}
                />
              </div>
            </div>
            
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="chart">Chart View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
                <VendorSalesTable 
                  data={filteredData}
                  months={months}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="chart">
                <VendorSalesChart
                  data={filteredData}
                  months={months}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VendorReport;
