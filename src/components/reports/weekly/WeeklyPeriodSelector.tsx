
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatWeekPeriod } from '@/utils/weekUtils';
import { WeeklySummary } from '@/hooks/useWeeklyData';

interface WeeklyPeriodSelectorProps {
  selectedYear: number;
  selectedWeek: number;
  selectedSalesperson: string;
  onYearChange: (year: number) => void;
  onWeekChange: (week: number) => void;
  onSalespersonChange: (salesperson: string) => void;
  summary: WeeklySummary | null;
}

export const WeeklyPeriodSelector: React.FC<WeeklyPeriodSelectorProps> = ({
  selectedYear,
  selectedWeek,
  selectedSalesperson,
  onYearChange,
  onWeekChange,
  onSalespersonChange,
  summary,
}) => {
  const { isAdmin } = useAuthStore();

  // Fetch available years from weeks table
  const { data: availableYears } = useQuery({
    queryKey: ['available-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weeks')
        .select('year')
        .order('year', { ascending: false });
      
      if (error) throw error;
      
      const uniqueYears = [...new Set(data.map(w => w.year))];
      return uniqueYears;
    },
  });

  // Fetch available weeks for selected year
  const { data: availableWeeks } = useQuery({
    queryKey: ['available-weeks', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weeks')
        .select('week_number')
        .eq('year', selectedYear)
        .order('week_number');
      
      if (error) throw error;
      return data.map(w => w.week_number);
    },
    enabled: !!selectedYear,
  });

  // Fetch salespersons for admin users
  const { data: salespersons } = useQuery({
    queryKey: ['salespersons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespersons')
        .select('spp_code, spp_name')
        .order('spp_name');
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const [weekPeriod, setWeekPeriod] = React.useState<string>('');

  React.useEffect(() => {
    const loadWeekPeriod = async () => {
      if (selectedYear && selectedWeek) {
        const period = await formatWeekPeriod(selectedYear, selectedWeek);
        setWeekPeriod(period);
      }
    };
    loadWeekPeriod();
  }, [selectedYear, selectedWeek]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Period Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="year-select">Year</Label>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => onYearChange(parseInt(value))}
            >
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears?.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="week-select">Week</Label>
            <Select 
              value={selectedWeek.toString()} 
              onValueChange={(value) => onWeekChange(parseInt(value))}
            >
              <SelectTrigger id="week-select">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {availableWeeks?.map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    Week {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="salesperson-select">Salesperson</Label>
              <Select 
                value={selectedSalesperson} 
                onValueChange={onSalespersonChange}
              >
                <SelectTrigger id="salesperson-select">
                  <SelectValue placeholder="Select salesperson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salespersons</SelectItem>
                  {salespersons?.map((sp) => (
                    <SelectItem key={sp.spp_code} value={sp.spp_code}>
                      {sp.spp_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        </div>

        {weekPeriod && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Week {selectedWeek} period: {weekPeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
