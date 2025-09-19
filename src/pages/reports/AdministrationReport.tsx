
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
import { useAdministrationData } from '@/hooks/useAdministrationData';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const monthRangeOptions = [
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' },
  { value: '24', label: 'Last 24 Months' },
  { value: '36', label: 'Last 36 Months' }
];

const AdministrationReport: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [monthRange, setMonthRange] = useState('12');
  const { summary, isLoading, error } = useAdministrationData(parseInt(monthRange, 10));

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold md:text-3xl">Administration Report</h1>
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
            {summary.length > 0 ? summary.map((item) => (
              <Card 
                key={item.year_month} 
                className="flex flex-col h-40 hover:shadow-md hover:border-primary/50 transition-all"
              >
                <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-medium mb-2">
                    {new Date(item.year_month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="text-3xl font-bold text-primary mb-1">
                    THB {formatCurrency(item.transportation_amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: THB {formatCurrency(item.cumulative_amount)}
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="col-span-4">
                <CardContent className="pt-6 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground">No transportation data available for the selected time range.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdministrationReport;
