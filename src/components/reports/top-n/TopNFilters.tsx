
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import ChannelFilter from '@/components/reports/channel/ChannelFilter';
import { BarChart3, User } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  spp_code: string | null;
}

interface TopNFiltersProps {
  fromDate: Date;
  toDate: Date;
  topN: number;
  salespersonCode: string;
  selectedChannel: string | null;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  onTopNChange: (value: number) => void;
  onSalespersonChange: (code: string) => void;
  onChannelChange: (channel: string | null) => void;
  onViewReport: () => void;
  loading: boolean;
  isAdmin: boolean;
  userProfile: Profile | null;
}

export const TopNFilters: React.FC<TopNFiltersProps> = ({
  fromDate,
  toDate,
  topN,
  salespersonCode,
  selectedChannel,
  onFromDateChange,
  onToDateChange,
  onTopNChange,
  onSalespersonChange,
  onChannelChange,
  onViewReport,
  loading,
  isAdmin,
  userProfile
}) => {
  // Local state for input display value (allows free typing)
  const [inputValue, setInputValue] = useState(topN.toString());

  // Sync input value when topN changes from parent
  useEffect(() => {
    setInputValue(topN.toString());
  }, [topN]);

  // Handle real-time input changes (allow free typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); // Allow any input during typing
  };

  // Handle validation when user finishes typing (onBlur)
  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 1) {
      // Reset to previous valid value if invalid
      setInputValue(topN.toString());
    } else {
      // Update with validated value
      const validValue = Math.max(1, Math.min(10000, numValue));
      onTopNChange(validValue);
      setInputValue(validValue.toString());
    }
  };

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur(); // Trigger validation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Top N Customer Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Context for Non-Admin */}
        {!isAdmin && userProfile?.spp_code && (
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Your Data Scope</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{userProfile.spp_code}</Badge>
              <span className="text-sm text-muted-foreground">
                Showing data for your assigned customers only
              </span>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-end ${
          isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
        }`}>
          <div className="space-y-2 lg:col-span-2">
            <DateRangeSelector
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={onFromDateChange}
              onToDateChange={onToDateChange}
            />
          </div>
          
          {/* Only show salesperson filter for admin users */}
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="salesperson">Salesperson</Label>
              <SalespersonFilter
                value={salespersonCode}
                onChange={onSalespersonChange}
              />
            </div>
          )}

          <div className="space-y-2">
            <ChannelFilter
              selectedChannel={selectedChannel}
              onChannelChange={onChannelChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="top-n">Top N Customers</Label>
            <Input
              id="top-n"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder="Enter number (e.g., 50, 500, 1000)"
              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={onViewReport}
            disabled={loading}
            className="w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {topN > 1000 ? 'Processing large dataset...' : 'Loading data...'}
              </span>
            ) : (
              'View Report'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
