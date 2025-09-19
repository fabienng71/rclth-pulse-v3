
import { Dispatch, SetStateAction } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface MonthOption {
  value: string;
  label: string;
}

interface CreditMemoFiltersProps {
  selectedMonth: string;
  setSelectedMonth: Dispatch<SetStateAction<string>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  monthOptions: MonthOption[];
}

const CreditMemoFilters = ({ 
  selectedMonth,
  setSelectedMonth,
  searchTerm,
  setSearchTerm,
  monthOptions
}: CreditMemoFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div className="w-full sm:w-64">
        <Select 
          value={selectedMonth} 
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customer or invoice..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full rounded-l-none"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreditMemoFilters;
