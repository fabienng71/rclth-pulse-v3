
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface Salesperson {
  spp_code: string;
  spp_name: string;
}

interface SalesTargetRowProps {
  salesperson: Salesperson;
  targetAmount: number;
  onTargetChange: (amount: number) => void;
}

export const SalesTargetRow: React.FC<SalesTargetRowProps> = ({
  salesperson,
  targetAmount,
  onTargetChange,
}) => {
  const [inputValue, setInputValue] = React.useState(targetAmount.toString());

  React.useEffect(() => {
    setInputValue(targetAmount.toString());
  }, [targetAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    const numericValue = parseFloat(inputValue) || 0;
    // Prevent negative values
    const finalValue = Math.max(0, numericValue);
    setInputValue(finalValue.toString());
    onTargetChange(finalValue);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <Label className="font-medium">{salesperson.spp_name}</Label>
              <p className="text-sm text-muted-foreground">Code: {salesperson.spp_code}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`target-${salesperson.spp_code}`} className="text-sm font-medium whitespace-nowrap">
                Target Amount:
              </Label>
              <Input
                id={`target-${salesperson.spp_code}`}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="0"
                className="w-32 text-right"
              />
            </div>
            {targetAmount > 0 && (
              <div className="text-xs text-muted-foreground">
                Formatted: {formatNumber(targetAmount)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
