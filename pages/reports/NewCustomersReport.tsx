
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useNewCustomersData } from '@/hooks/useNewCustomersData';
import { UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const monthRangeOptions = [
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' },
  { value: '24', label: 'Last 24 Months' },
  { value: '36', label: 'Last 36 Months' }
];

const NewCustomersReport: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [monthRange, setMonthRange] = useState('12');
  const { summary, isLoading, error } = useNewCustomersData(parseInt(monthRange, 10));

  // DEBUG: Enhanced logging to understand the issue
  console.log('🔍 NewCustomersReport Debug:', {
    summary: summary,
    summaryLength: summary?.length,
    isLoading,
    error: error?.message,
    monthRange,
    parsedMonthRange: parseInt(monthRange, 10),
    isAdmin
  });

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // Ensure consistent month format when navigating to detail page
  const handleCardClick = (month: string) => {
    // Make sure month is properly formatted before navigation
    const formattedMonth = month.trim();
    console.log('Navigating to month:', formattedMonth);
    
    if (!formattedMonth) {
      toast({
        title: "Invalid month format",
        description: "Cannot navigate to an empty month value",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/reports/new-customers/${formattedMonth}`);
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <UserPlus className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold md:text-3xl">New Customers Report</h1>
          </div>
          <Select
            value={monthRange}
            onValueChange={(value) => setMonthRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {monthRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">Error loading data: {error.message}</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="flex flex-col h-40">
                <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
                  <div className="h-6 w-32 bg-muted/20 animate-pulse rounded mb-2"></div>
                  <div className="h-8 w-16 bg-muted/20 animate-pulse rounded mb-2"></div>
                  <div className="h-6 w-24 bg-muted/20 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {summary && summary.length > 0 ? summary.map((item) => (
              <Card 
                key={item.year_month} 
                className="flex flex-col h-40 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => handleCardClick(item.year_month)}
              >
                <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-medium mb-2">
                    {(() => {
                      try {
                        return new Date(item.year_month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      } catch (err) {
                        console.error('Date formatting error for:', item.year_month, err);
                        return item.year_month;
                      }
                    })()}
                  </h3>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {item.new_customer_count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Customers: {item.cumulative_customer_count}
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="col-span-4">
                <CardContent className="pt-6 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground">No new customer data available for the selected time range.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Debug: summary={summary?.length || 0}, isLoading={isLoading.toString()}, error={error?.message || 'none'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected 14 records based on backend tests. Check browser console for more info.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default NewCustomersReport;
