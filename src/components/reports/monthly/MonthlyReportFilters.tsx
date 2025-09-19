import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MonthYearSelector } from '@/components/reports/margin-analysis/MonthYearSelector';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';

interface MonthlyReportFiltersProps {
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  includeCreditMemos: boolean;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onSalespersonChange: (salesperson: string) => void;
  onCreditMemosToggle: (include: boolean) => void;
  isLoading?: boolean;
}

export const MonthlyReportFilters: React.FC<MonthlyReportFiltersProps> = ({
  selectedYear,
  selectedMonth,
  selectedSalesperson,
  includeCreditMemos,
  onYearChange,
  onMonthChange,
  onSalespersonChange,
  onCreditMemosToggle,
  isLoading = false,
}) => {
  return (
    <Card className="bg-background-container shadow-soft transition-smooth mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <MonthYearSelector
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              setSelectedYear={onYearChange}
              setSelectedMonth={onMonthChange}
              isRefreshing={isLoading}
            />
            
            <div className="flex items-center gap-4">
              <SalespersonFilter
                value={selectedSalesperson}
                onChange={onSalespersonChange}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="include-credit-memos" 
              checked={includeCreditMemos} 
              onCheckedChange={onCreditMemosToggle}
              disabled={isLoading}
            />
            <Label htmlFor="include-credit-memos" className="cursor-pointer">
              Include Credit Memos
            </Label>
            <div className="relative group ml-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              <div className="absolute z-10 invisible group-hover:visible bg-secondary text-secondary-foreground 
                            p-2 rounded shadow-lg right-0 w-64 text-xs">
                When enabled, shows net values after deducting credit memos. 
                When disabled, shows gross sales without credit memo adjustments.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};