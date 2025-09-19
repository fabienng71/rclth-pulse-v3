
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ViewMode } from '@/hooks/useMarginAnalysisData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarginCategory } from '@/hooks/useMarginAnalysisData';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';

export interface FilterControlsProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  activeTab?: string;
  categoryOptions?: MarginCategory[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  viewMode,
  setViewMode,
  selectedCategory,
  onCategoryChange,
  activeTab,
  categoryOptions = []
}) => {
  // Generate years for select dropdown (5 years back, current year, 1 year future)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Handle toggle change
  const handleCreditMemoToggle = (checked: boolean) => {
    setViewMode(checked ? 'adjusted' : 'standard');
  };

  // Get unique posting groups for the category filter - with proper null checking
  const uniqueCategories = React.useMemo(() => {
    if (!categoryOptions || categoryOptions.length === 0) return [];
    
    const categoriesSet = new Set<string>();
    categoryOptions.forEach(category => {
      if (category?.posting_group && typeof category.posting_group === 'string') {
        categoriesSet.add(category.posting_group);
      }
    });
    
    return Array.from(categoriesSet).sort();
  }, [categoryOptions]);

  // Handle clearing the category filter
  const handleClearCategoryFilter = () => {
    if (onCategoryChange) {
      onCategoryChange(null);
    }
  };

  // Handle category selection with proper value validation
  const handleCategoryValueChange = (value: string) => {
    if (onCategoryChange) {
      // Only pass null if the value is the "all" option, otherwise pass the actual value
      onCategoryChange(value === "all-categories" ? null : value);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-1">Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="month" className="block text-sm font-medium mb-1">Month</label>
            <select
              id="month"
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {months.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="credit-memo-toggle" 
              checked={viewMode === 'adjusted'} 
              onCheckedChange={handleCreditMemoToggle}
            />
            <Label htmlFor="credit-memo-toggle" className="cursor-pointer">
              {viewMode === 'adjusted' ? 'Deducting Credit Memos' : 'Include Credit Memos'}
            </Label>
          </div>
          
          {/* Show category filter only when on the categories tab */}
          {activeTab === 'categories' && onCategoryChange && (
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="category-filter" className="block text-sm font-medium">Filter by Category</label>
                {selectedCategory && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs" 
                    onClick={handleClearCategoryFilter}
                  >
                    <FilterX className="h-3 w-3 mr-1" />
                    Clear filter
                  </Button>
                )}
              </div>
              <Select
                value={selectedCategory || "all-categories"}
                onValueChange={handleCategoryValueChange}
              >
                <SelectTrigger className="w-full" id="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
