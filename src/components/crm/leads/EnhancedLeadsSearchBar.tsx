
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnhancedLeadsSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSalesperson: string;
  onSalespersonChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  salespersonOptions: string[];
  onClearFilters: () => void;
}

export const EnhancedLeadsSearchBar = ({
  searchQuery,
  onSearchChange,
  selectedSalesperson,
  onSalespersonChange,
  selectedStatus,
  onStatusChange,
  salespersonOptions,
  onClearFilters
}: EnhancedLeadsSearchBarProps) => {
  const statusOptions = [
    'New',
    'Contacted',
    'Deal in Progress',
    'Won',
    'Not Qualified'
  ];

  const activeFiltersCount = [
    selectedSalesperson !== 'all' ? 1 : 0,
    selectedStatus !== 'all' ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search leads by name, email, phone, or industry..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                Salesperson
                {selectedSalesperson !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Filter by Salesperson</h4>
                  <Select value={selectedSalesperson} onValueChange={onSalespersonChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salesperson" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Salespeople</SelectItem>
                      {salespersonOptions.map((person) => (
                        <SelectItem key={person} value={person}>
                          {person}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                Status
                {selectedStatus !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Filter by Status</h4>
                  <Select value={selectedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedSalesperson !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Salesperson: {selectedSalesperson}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onSalespersonChange('all')}
              />
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {selectedStatus}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onStatusChange('all')}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
