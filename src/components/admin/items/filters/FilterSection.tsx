import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterX, LucideIcon } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FilterSectionProps {
  title: string;
  icon: LucideIcon;
  options: FilterOption[];
  selectedValues: string[];
  onValueChange: (value: string, checked: boolean) => void;
  onClear: () => void;
  emptyMessage?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon: Icon,
  options,
  selectedValues,
  onValueChange,
  onClear,
  emptyMessage = `No ${title.toLowerCase()} available`
}) => {
  const hasSelectedValues = selectedValues.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <Label className="text-sm font-medium">{title}</Label>
        </div>
        {hasSelectedValues && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 px-2 text-xs"
          >
            <FilterX className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`${title.toLowerCase()}-${option.id}`}
              checked={selectedValues.includes(option.id)}
              onCheckedChange={(checked) => 
                onValueChange(option.id, checked as boolean)
              }
            />
            <Label 
              htmlFor={`${title.toLowerCase()}-${option.id}`} 
              className="text-xs flex-1 cursor-pointer"
            >
              {option.label}
              <span className="text-muted-foreground ml-1">({option.count})</span>
            </Label>
          </div>
        ))}
        {options.length === 0 && (
          <div className="text-xs text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};