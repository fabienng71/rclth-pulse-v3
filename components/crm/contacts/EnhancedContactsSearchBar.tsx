
import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
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

interface EnhancedContactsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSalesperson: string;
  onSalespersonChange: (salesperson: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  salespersonOptions: string[];
  regionOptions: string[];
  onClearFilters: () => void;
  totalResults?: number;
}

export const EnhancedContactsSearchBar: React.FC<EnhancedContactsSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSalesperson,
  onSalespersonChange,
  selectedRegion,
  onRegionChange,
  selectedStatus,
  onStatusChange,
  salespersonOptions,
  regionOptions,
  onClearFilters,
  totalResults = 0,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const activeFiltersCount = [
    selectedSalesperson !== 'all',
    selectedRegion !== 'all',
    selectedStatus !== 'all',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="space-y-3">
      {/* Search Bar with integrated Filter Button */}
      <div className="relative">
        <div className={`relative transition-all duration-200 ${
          searchFocused ? 'ring-2 ring-primary/20' : ''
        }`}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name, company, email, or position..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="pl-10 pr-20 h-11 text-base"
          />
          
          {/* Filter Button integrated in search bar */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={hasActiveFilters ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2 relative"
                >
                  <Filter className="h-3 w-3" />
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center bg-primary/10 text-primary"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[600px] p-4">
                <div className="space-y-3">
                  <div className="font-medium text-sm">Filter Contacts</div>
                  
                  {/* Horizontal Filter Layout */}
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">Salesperson</label>
                      <Select value={selectedSalesperson} onValueChange={onSalespersonChange}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Salespersons</SelectItem>
                          {salespersonOptions.map((salesperson) => (
                            <SelectItem key={salesperson} value={salesperson}>
                              {salesperson}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">Region</label>
                      <Select value={selectedRegion} onValueChange={onRegionChange}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          {regionOptions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">Status</label>
                      <Select value={selectedStatus} onValueChange={onStatusChange}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="prospect">Prospect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onClearFilters();
                            setIsFiltersOpen(false);
                          }}
                          className="h-8 text-xs"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="h-7 w-7 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Search Results Count */}
        {(searchQuery || hasActiveFilters) && (
          <div className="absolute right-0 top-full mt-1 text-sm text-muted-foreground">
            {totalResults} contact{totalResults !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {selectedSalesperson !== 'all' && (
            <Badge variant="secondary" className="text-xs h-6">
              Salesperson: {selectedSalesperson}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => onSalespersonChange('all')}
              />
            </Badge>
          )}
          {selectedRegion !== 'all' && (
            <Badge variant="secondary" className="text-xs h-6">
              Region: {selectedRegion}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => onRegionChange('all')}
              />
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="text-xs h-6">
              Status: {selectedStatus}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => onStatusChange('all')}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onClearFilters();
            }}
            className="text-xs h-6 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};
