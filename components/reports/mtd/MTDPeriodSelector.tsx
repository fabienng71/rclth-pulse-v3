
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, TrendingUp, Settings, Info } from 'lucide-react';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { useAuthStore } from '@/stores/authStore';
import { MTDSummary, MTDDataOptions } from '@/hooks/useMTDData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MTDPeriodSelectorProps {
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onSalespersonChange: (salesperson: string) => void;
  summary?: MTDSummary;
  holidays?: Date[];
  dataOptions: MTDDataOptions;
  onDataOptionsChange: (options: MTDDataOptions) => void;
  isLoading?: boolean;
}

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const MTDPeriodSelector: React.FC<MTDPeriodSelectorProps> = ({
  selectedYear,
  selectedMonth,
  selectedSalesperson,
  onYearChange,
  onMonthChange,
  onSalespersonChange,
  summary,
  holidays = [],
  dataOptions,
  onDataOptionsChange,
  isLoading = false,
}) => {
  const { isAdmin } = useAuthStore();
  const currentDate = new Date();

  // Calculate projection based on working days average
  const calculateProjection = () => {
    if (!summary) return 0;
    
    // Use the corrected daily average from summary and multiply by total working days
    return summary.current_year_avg_daily * summary.total_working_days;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const projection = calculateProjection();

  const handleDeliveryFeesChange = (checked: boolean) => {
    onDataOptionsChange({
      ...dataOptions,
      includeDeliveryFees: checked,
    });
  };

  const handleCreditMemosChange = (checked: boolean) => {
    onDataOptionsChange({
      ...dataOptions,
      includeCreditMemos: checked,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Period & Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Period and Filter Selection */}
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => onYearChange(parseInt(e.target.value) || currentDate.getFullYear())}
                className="w-24"
                min="2020"
                max="2030"
              />
            </div>

            {isAdmin && (
              <div className="space-y-2 min-w-48">
                <SalespersonFilter
                  value={selectedSalesperson}
                  onChange={onSalespersonChange}
                />
              </div>
            )}

          </div>

          {/* Data Inclusion Options */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              <Label className="text-sm font-medium">Data Inclusion Options</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded border">
                <div className="flex items-center gap-2">
                  <Label htmlFor="delivery-fees" className="text-sm font-medium">
                    Include Delivery Fees
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Include service fees and delivery charges in sales calculations</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (Transactions with item_code IS NULL AND posting_group = 'SRV')
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch
                  id="delivery-fees"
                  checked={dataOptions.includeDeliveryFees}
                  onCheckedChange={handleDeliveryFeesChange}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded border">
                <div className="flex items-center gap-2">
                  <Label htmlFor="credit-memos" className="text-sm font-medium">
                    Include Credit Memos
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Include credit memo adjustments in net sales calculations</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          When enabled, credit memos are subtracted from gross sales
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch
                  id="credit-memos"
                  checked={dataOptions.includeCreditMemos}
                  onCheckedChange={handleCreditMemosChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
