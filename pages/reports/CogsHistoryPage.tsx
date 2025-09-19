import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import CogsHistoryChart from '@/components/reports/CogsHistoryChart';
import { useVendorsData } from '@/hooks/useVendorsData';
import ItemFilterBar from '@/components/reports/ItemFilterBar';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { subMonths } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CogsHistoryPage = () => {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const { vendors, isLoading: vendorsLoading } = useVendorsData();
  
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    return subMonths(date, 6);
  });
  const [toDate, setToDate] = useState(() => new Date());
  
  const handleGoBack = () => {
    navigate('/reports/cogs');
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
            <h1 className="text-2xl font-bold md:text-3xl">COGS History Report</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>COGS History Analysis</CardTitle>
            <CardDescription>
              View cost history information for all items by month
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <DateRangeSelector
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
              />
            </div>
            
            <ItemFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              vendorFilter={vendorFilter}
              setVendorFilter={setVendorFilter}
              vendors={vendors}
            />
            
            <CogsHistoryChart 
              searchTerm={searchTerm} 
              vendorFilter={vendorFilter}
              fromDate={fromDate}
              toDate={toDate}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CogsHistoryPage;
