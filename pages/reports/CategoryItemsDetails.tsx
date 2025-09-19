
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCategoryItemsData } from '@/hooks/useCategoryItemsData';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { generateAllMonthsInRange } from '@/hooks/channel-sales/dateUtils';
import { formatMonth } from '@/components/reports/monthly-data/formatUtil';
import { CustomerDataSyncButton } from '@/components/reports/sync/CustomerDataSyncButton';
import { useAuthStore } from '@/stores/authStore';

const CategoryItemsDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuthStore();
  
  const categoryCode = searchParams.get('category');
  const fromDateStr = searchParams.get('from');
  const toDateStr = searchParams.get('to');
  
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [months, setMonths] = useState<string[]>([]);
  
  // Parse date strings from URL
  useEffect(() => {
    if (fromDateStr) {
      try {
        setFromDate(new Date(fromDateStr));
      } catch (error) {
        toast.error('Invalid from date in URL');
      }
    }
    
    if (toDateStr) {
      try {
        setToDate(new Date(toDateStr));
      } catch (error) {
        toast.error('Invalid to date in URL');
      }
    }
  }, [fromDateStr, toDateStr]);
  
  // Generate months array when dates change
  useEffect(() => {
    const monthsArray = generateAllMonthsInRange(fromDate, toDate);
    setMonths(monthsArray);
  }, [fromDate, toDate]);
  
  const {
    data: itemsData,
    isLoading,
    error,
    isError
  } = useCategoryItemsData(categoryCode || '', fromDate, toDate);
  
  useEffect(() => {
    if (isError && error) {
      toast.error(`Error loading category items: ${error.message}`);
    }
  }, [isError, error]);
  
  const handleGoBack = () => {
    navigate('/reports/categories');
  };
  
  // Calculate monthly totals
  const calculateMonthlyTotals = () => {
    const monthlyTotals: Record<string, number> = {};
    
    months.forEach(month => {
      monthlyTotals[month] = 0;
    });
    
    if (itemsData) {
      itemsData.forEach(item => {
        months.forEach(month => {
          if (item.months[month]) {
            monthlyTotals[month] += item.months[month];
          }
        });
      });
    }
    
    return monthlyTotals;
  };
  
  const monthlyTotals = calculateMonthlyTotals();
  
  // Calculate grand total
  const grandTotal = itemsData?.reduce((sum, item) => sum + item.total_turnover, 0) || 0;
  
  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleGoBack}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Category Items Details</h1>
          </div>
          
          {isAdmin && (
            <div className="mt-4 md:mt-0">
              <CustomerDataSyncButton />
            </div>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Items in Category: {categoryCode}</CardTitle>
            <CardDescription>
              {`Showing items sales from ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">Loading item data...</div>
            ) : isError ? (
              <div className="flex justify-center p-6 text-red-600">Error: {error.message}</div>
            ) : itemsData && itemsData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      {months.map(month => (
                        <TableHead key={month} className="text-right">
                          {formatMonth(month)}
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">% of Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsData.map((item) => (
                      <TableRow key={item.item_code}>
                        <TableCell>{item.item_code}</TableCell>
                        <TableCell className="unicode-text">{item.description?.normalize('NFC')}</TableCell>
                        {months.map(month => (
                          <TableCell key={month} className="text-right">
                            {formatCurrency(item.months[month] || 0)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">{formatCurrency(item.total_turnover)}</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={2}>Total</TableCell>
                      {months.map(month => (
                        <TableCell key={month} className="text-right">
                          {formatCurrency(monthlyTotals[month])}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">{formatCurrency(grandTotal)}</TableCell>
                      <TableCell className="text-right">100.0%</TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
              </div>
            ) : (
              <div className="flex justify-center p-6">No items found for this category.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CategoryItemsDetails;
