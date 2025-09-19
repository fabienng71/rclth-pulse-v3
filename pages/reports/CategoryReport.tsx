
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import CategoryFilter from '@/components/reports/category/CategoryFilter';
import CategorySalesTable from '@/components/reports/category/CategorySalesTable';
import CategorySalesChart from '@/components/reports/category/CategorySalesChart';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { useCategorySalesData } from '@/hooks/useCategorySalesData';

const CategoryReport = () => {
  const navigate = useNavigate();
  const { isAdmin, profile } = useAuthStore();
  
  const [fromDate, setFromDate] = useState(() => {
    // Default to last 6 months
    return startOfMonth(subMonths(new Date(), 6));
  });
  
  const [toDate, setToDate] = useState(() => {
    return endOfMonth(new Date());
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("table");
  
  // Use our new hook
  const { 
    data,
    isLoading, 
    error,
    isError
  } = useCategorySalesData(fromDate, toDate);

  // Filter data based on selected category
  const filteredData = selectedCategory 
    ? { 
        categoryData: data?.categoryData.filter(cat => cat.posting_group === selectedCategory) || [],
        months: data?.months || [] 
      }
    : data;

  useEffect(() => {
    if (isError && error) {
      toast.error(`Error loading data: ${error.message}`);
      console.error('Category report error:', error);
    }
  }, [isError, error]);
  
  const handleGoBack = () => {
    navigate('/reports');
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    // Ensure we're using the first and last day of the months
    setFromDate(startOfMonth(start));
    setToDate(endOfMonth(end));
  };
  
  const handleViewCategoryDetails = (category: string) => {
    // Navigate to category details page with the selected category and date range
    navigate(`/reports/categories/details?category=${category}&from=${fromDate.toISOString()}&to=${toDate.toISOString()}`);
  };

  // Validate that the date range is reasonable (not too large)
  useEffect(() => {
    const maxMonths = 24; // Maximum 24 months of data to prevent performance issues
    const monthDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                      (toDate.getMonth() - fromDate.getMonth());
                      
    if (monthDiff > maxMonths) {
      toast.warning(`Date range is too large (${monthDiff} months). Please select a range up to ${maxMonths} months.`);
      // Adjust the from date to be at most maxMonths before to date
      setFromDate(startOfMonth(subMonths(toDate, maxMonths)));
    }
  }, [fromDate, toDate]);

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
            <h1 className="text-2xl font-bold md:text-3xl">Category Sales Report</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Category Monthly Sales</CardTitle>
            <CardDescription>
              View monthly sales data for each category
              {!isAdmin && profile?.spp_code && (
                <Badge variant="outline" className="ml-2">
                  Filtered by your sales code: {profile.spp_code}
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-6">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categoryData={data?.categoryData}
                />
              </div>
              
              <div>
                <DateRangeSelector
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={(date) => handleDateRangeChange(date, toDate)}
                  onToDateChange={(date) => handleDateRangeChange(fromDate, date)}
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="chart">Chart View</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <CategorySalesTable 
                  data={filteredData?.categoryData || []}
                  months={filteredData?.months || []}
                  isLoading={isLoading}
                  error={error}
                  onCategoryClick={handleViewCategoryDetails}
                />
              </TabsContent>
              <TabsContent value="chart">
                <CategorySalesChart 
                  data={filteredData?.categoryData || []}
                  months={filteredData?.months || []}
                  isLoading={isLoading}
                  error={error}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CategoryReport;
