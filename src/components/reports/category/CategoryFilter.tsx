
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategorySalesData, CategorySalesData } from '@/hooks/useCategorySalesData';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categoryData?: CategorySalesData[];
}

const CategoryFilter = ({ selectedCategory, onCategoryChange, categoryData = [] }: CategoryFilterProps) => {
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  
  // Process category data to build a map of codes to names
  useEffect(() => {
    if (categoryData.length > 0) {
      const map: Record<string, string> = {};
      categoryData.forEach(category => {
        // Only include categories with valid posting_group values
        if (category.posting_group && category.posting_group.trim() !== '') {
          map[category.posting_group] = category.category_name || category.posting_group;
        }
      });
      setCategoryMap(map);
    }
  }, [categoryData]);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Filter by Category</label>
        {selectedCategory && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs" 
            onClick={() => onCategoryChange(null)}
          >
            <FilterX className="h-3 w-3 mr-1" />
            Clear filter
          </Button>
        )}
      </div>
      
      <Select
        value={selectedCategory || "all"}
        onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Object.entries(categoryMap)
            .filter(([code, name]) => code && code.trim() !== '') // Filter out empty codes
            .map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name} ({code})
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoryFilter;
