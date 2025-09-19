import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface SalesAnalyticsPeriodSelectorProps {
  selectedYear: number;
  selectedWeek: number;
  selectedMonth?: number;
  selectedSalesperson: string;
  analysisType: 'weekly' | 'monthly';
  onYearChange: (year: number) => void;
  onWeekChange: (week: number) => void;
  onMonthChange?: (month: number) => void;
  onSalespersonChange: (salesperson: string) => void;
  onAnalysisTypeChange: (type: 'weekly' | 'monthly') => void;
}

export const SalesAnalyticsPeriodSelector: React.FC<SalesAnalyticsPeriodSelectorProps> = ({
  selectedYear,
  selectedWeek,
  selectedMonth,
  selectedSalesperson,
  analysisType,
  onYearChange,
  onWeekChange,
  onMonthChange,
  onSalespersonChange,
  onAnalysisTypeChange,
}) => {
  const { isAdmin } = useAuthStore();

  // Fetch available salespersons
  const { data: salespersons } = useQuery({
    queryKey: ['salespersons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespersons')
        .select('spp_code, spp_name')
        .order('spp_name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch available weeks for the selected year
  const { data: weeks } = useQuery({
    queryKey: ['weeks', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weeks')
        .select('week_number, start_date, end_date')
        .eq('year', selectedYear)
        .order('week_number');

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedYear,
  });

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 3 },
    (_, i) => currentYear - i
  );

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', { month: 'long' })
  }));

  const formatWeekOption = (week: any) => {
    const startDate = new Date(week.start_date);
    const endDate = new Date(week.end_date);
    return `Week ${week.week_number} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
  };

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Analysis Period & Scope
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Analysis Type Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium">Analysis Type</label>
          <div className="flex gap-2 mt-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === 'weekly' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background-secondary text-muted-foreground hover:bg-background-tertiary'
              }`}
              onClick={() => onAnalysisTypeChange('weekly')}
            >
              Weekly Analysis
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === 'monthly' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background-secondary text-muted-foreground hover:bg-background-tertiary'
              }`}
              onClick={() => onAnalysisTypeChange('monthly')}
            >
              Monthly Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => onYearChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Selection - Week or Month */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {analysisType === 'weekly' ? 'Week' : 'Month'}
            </label>
            {analysisType === 'weekly' ? (
              <Select
                value={selectedWeek.toString()}
                onValueChange={(value) => onWeekChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {weeks?.map((week) => (
                    <SelectItem key={week.week_number} value={week.week_number.toString()}>
                      {formatWeekOption(week)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={selectedMonth?.toString() || ''}
                onValueChange={(value) => onMonthChange?.(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Salesperson Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Salesperson</label>
            <Select
              value={selectedSalesperson}
              onValueChange={onSalespersonChange}
              disabled={!isAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select salesperson" />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && (
                  <SelectItem value="all">All Salespersons</SelectItem>
                )}
                {salespersons?.map((salesperson) => (
                  <SelectItem key={salesperson.spp_code} value={salesperson.spp_code}>
                    {salesperson.spp_name} ({salesperson.spp_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analysis Scope Info */}
        <div className="mt-4 p-3 bg-background-secondary rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Analysis Scope</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Period:</span>
              <p className="font-medium">
                {analysisType === 'weekly' 
                  ? `${selectedYear} - Week ${selectedWeek}` 
                  : `${selectedMonth ? monthOptions.find(m => m.value === selectedMonth)?.label : ''} ${selectedYear}`
                }
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Salesperson:</span>
              <p className="font-medium">
                {selectedSalesperson === 'all' ? 'All Salespersons' : 
                 salespersons?.find(s => s.spp_code === selectedSalesperson)?.spp_name || selectedSalesperson}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Comparison:</span>
              <p className="font-medium">
                vs {analysisType === 'weekly' ? 'Previous Week' : 'Previous Month'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};