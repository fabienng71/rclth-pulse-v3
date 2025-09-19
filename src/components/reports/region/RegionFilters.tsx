import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { BarChart3 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  spp_code: string | null;
}

interface RegionFiltersProps {
  fromDate: Date;
  toDate: Date;
  salespersonCode: string;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  onSalespersonChange: (code: string) => void;
  onViewReport: () => void;
  loading: boolean;
  isAdmin: boolean;
  userProfile: Profile | null;
}

export const RegionFilters: React.FC<RegionFiltersProps> = ({
  fromDate,
  toDate,
  salespersonCode,
  onFromDateChange,
  onToDateChange,
  onSalespersonChange,
  onViewReport,
  loading,
  isAdmin,
  userProfile,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Region Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 mb-4 ${isAdmin ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
          <div className={isAdmin ? "md:col-span-2" : "w-full"}>
            <DateRangeSelector
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={onFromDateChange}
              onToDateChange={onToDateChange}
            />
          </div>
          
          {isAdmin && (
            <div className="space-y-2">
              <label htmlFor="salesperson-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Salesperson
              </label>
              <SalespersonFilter
                value={salespersonCode}
                onChange={onSalespersonChange}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {!isAdmin && userProfile?.spp_code && (
              <span>
                Filtered to your customers only ({userProfile.spp_code})
              </span>
            )}
            {isAdmin && salespersonCode !== 'all' && (
              <span>
                Filtered to salesperson: {salespersonCode}
              </span>
            )}
            {isAdmin && salespersonCode === 'all' && (
              <span>
                Showing all salespeople
              </span>
            )}
          </div>
          
          <Button 
            onClick={onViewReport}
            disabled={loading || !fromDate || !toDate}
            className="min-w-32"
          >
            {loading ? 'Loading...' : 'View Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};