
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonthYearSelector } from './MonthYearSelector';
import { SalesTargetRow } from './SalesTargetRow';
import { useSalesTargets } from '@/hooks/useSalesTargets';
import { useSalespersonsData } from '@/hooks/useCustomersData';
import { useToast } from '@/hooks/use-toast';
import { Save, Calendar } from 'lucide-react';

interface SalesTargetsFormProps {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export const SalesTargetsForm: React.FC<SalesTargetsFormProps> = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}) => {
  const { toast } = useToast();
  const { salespersons } = useSalespersonsData();
  const { targets, isLoading, saveTargets, isSaving } = useSalesTargets(selectedYear, selectedMonth);
  const [targetAmounts, setTargetAmounts] = useState<Record<string, number>>({});

  // Initialize target amounts when targets data changes
  React.useEffect(() => {
    if (targets) {
      const amounts: Record<string, number> = {};
      targets.forEach(target => {
        amounts[target.salesperson_code] = target.target_amount || 0;
      });
      setTargetAmounts(amounts);
    }
  }, [targets]);

  const handleTargetChange = (salespersonCode: string, amount: number) => {
    setTargetAmounts(prev => ({
      ...prev,
      [salespersonCode]: amount
    }));
  };

  const handleSave = async () => {
    try {
      const targetsToSave = Object.entries(targetAmounts)
        .filter(([_, amount]) => amount > 0) // Only save positive values
        .map(([salespersonCode, amount]) => ({
          salesperson_code: salespersonCode,
          month: selectedMonth,
          year: selectedYear,
          target_amount: amount,
        }));

      await saveTargets(targetsToSave);
      
      const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
      const savedCount = targetsToSave.length;
      
      toast({
        title: "Success",
        description: `${savedCount} sales target${savedCount !== 1 ? 's' : ''} saved successfully for ${monthName} ${selectedYear}`,
      });
    } catch (error) {
      console.error('Error saving targets:', error);
      toast({
        title: "Error",
        description: "Failed to save sales targets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
  const hasChanges = Object.values(targetAmounts).some(amount => amount > 0);

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Target Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthYearSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Setting targets for {monthName} {selectedYear}
          </p>
        </CardContent>
      </Card>

      {/* Targets Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Sales Targets
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Targets'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {salespersons.map((salesperson) => (
                <SalesTargetRow
                  key={salesperson.spp_code}
                  salesperson={salesperson}
                  targetAmount={targetAmounts[salesperson.spp_code] || 0}
                  onTargetChange={(amount) => handleTargetChange(salesperson.spp_code, amount)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
