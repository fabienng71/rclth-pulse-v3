
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { WeekSelector } from './WeekSelector';
import { useCallback } from 'react';

interface ActivityFiltersProps {
  filterType: string;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
  selectedSalesperson: string;
  onSalespersonChange: (salesperson: string) => void;
  salespersonOptions: string[];
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
}

export const ActivityFilters = ({
  filterType,
  onTypeChange,
  onClearFilters,
  selectedSalesperson,
  onSalespersonChange,
  salespersonOptions,
  selectedWeek,
  onWeekChange,
}: ActivityFiltersProps) => {
  const { isAdmin } = useAuthStore();

  // Filter out any empty salesperson names and ensure we have valid values for SelectItem
  const validSalespersonOptions = (salespersonOptions || [])
    .filter(name => name && name.trim() !== '')
    .map((name, index) => ({ 
      name, 
      // Use deterministic IDs based on name content and position
      id: `sp-${index}-${name.replace(/\s+/g, '-').toLowerCase()}` 
    }));

  // Memoize the clear filters handler
  const handleClearFilters = useCallback(() => {
    onWeekChange(null); // Clear week selection
    onClearFilters(); // Call original clear function
  }, [onWeekChange, onClearFilters]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filterType || 'all'}
          onValueChange={onTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {filterType ? filterType === 'all' ? 'All Types' : filterType : 'Filter by type'}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
            <SelectItem value="Walk-in">Walk-in</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Phone Call">Phone Call</SelectItem>
          </SelectContent>
        </Select>

        <WeekSelector 
          selectedWeek={selectedWeek}
          onWeekChange={onWeekChange}
        />

        {isAdmin && validSalespersonOptions.length > 0 && (
          <Select
            value={selectedSalesperson || 'all'}
            onValueChange={onSalespersonChange}
          >
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {selectedSalesperson === 'all' ? 'All Salespersons' : selectedSalesperson || 'All Salespersons'}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salespersons</SelectItem>
              {validSalespersonOptions.map((item) => (
                <SelectItem 
                  key={item.id} 
                  value={item.name}
                >
                  {item.name || "Unnamed Salesperson"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(filterType || selectedSalesperson !== 'all' || selectedWeek !== null) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
