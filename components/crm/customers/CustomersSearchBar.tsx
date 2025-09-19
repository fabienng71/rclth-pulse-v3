
import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { useAuthStore } from '@/stores/authStore';

interface CustomersSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  hideZeroTurnover: boolean;
  onHideZeroTurnoverChange: (value: boolean) => void;
  selectedSalesperson: string;
  onSalespersonChange: (value: string) => void;
}

export const CustomersSearchBar: React.FC<CustomersSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  hideZeroTurnover,
  onHideZeroTurnoverChange,
  selectedSalesperson,
  onSalespersonChange
}) => {
  const { isAdmin } = useAuthStore();

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers by name, search name, or customer code..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Salesperson Filter - Only show for admin users */}
        {isAdmin && (
          <div className="w-full sm:w-auto">
            <Label className="text-sm font-medium mb-2 block">Salesperson</Label>
            <SalespersonFilter
              value={selectedSalesperson}
              onChange={onSalespersonChange}
            />
          </div>
        )}
        
        {/* Zero Turnover Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="hide-zero-turnover"
            checked={hideZeroTurnover}
            onCheckedChange={onHideZeroTurnoverChange}
          />
          <Label htmlFor="hide-zero-turnover" className="whitespace-nowrap">
            Hide zero turnover
          </Label>
        </div>

        {/* Clear Filters */}
        {(selectedSalesperson !== 'all' || hideZeroTurnover || searchQuery) && (
          <button
            onClick={() => {
              onSearchChange('');
              onHideZeroTurnoverChange(false);
              onSalespersonChange('all');
            }}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
