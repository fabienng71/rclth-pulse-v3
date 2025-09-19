import React from 'react';
import { Loader2, Package, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemCard } from './ItemCard';
import { ItemAnalytics, ItemsV2ViewConfig } from '@/types/itemsV2';
import { cn } from '@/lib/utils';

interface ItemsGridProps {
  items: ItemAnalytics[];
  isLoading: boolean;
  viewConfig: ItemsV2ViewConfig;
  searchTerm?: string;
  hasFiltersApplied?: boolean;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
  onViewDetails?: (itemCode: string) => void;
  onToggleFavorite?: (itemCode: string) => void;
  onClearFilters?: () => void;
  onShowFilters?: () => void;
  className?: string;
}

export const ItemsGrid: React.FC<ItemsGridProps> = ({
  items,
  isLoading,
  viewConfig,
  searchTerm,
  hasFiltersApplied,
  onQuickQuote,
  onRequestSample,
  onViewDetails,
  onToggleFavorite,
  onClearFilters,
  onShowFilters,
  className
}) => {
  // Determine grid columns based on card size and screen size
  const getGridClasses = () => {
    const baseClasses = "grid gap-4 md:gap-6";
    
    switch (viewConfig.card_size) {
      case 'compact':
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`;
      case 'standard':
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
      case 'detailed':
        return `${baseClasses} grid-cols-1 md:grid-cols-2 xl:grid-cols-3`;
      default:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Loading skeleton */}
        <div className={getGridClasses()}>
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "animate-pulse bg-gray-200 rounded-lg",
                viewConfig.card_size === 'compact' ? "h-32" :
                viewConfig.card_size === 'detailed' ? "h-80" : "h-48"
              )}
            />
          ))}
        </div>
        
        {/* Loading indicator */}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading items...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 space-y-4", className)}>
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          {searchTerm || hasFiltersApplied ? (
            <Search className="h-8 w-8 text-gray-400" />
          ) : (
            <Package className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {searchTerm || hasFiltersApplied ? 'No items match your criteria' : 'No items found'}
          </h3>
          
          <p className="text-muted-foreground max-w-md">
            {searchTerm && !hasFiltersApplied && (
              <>
                No items match "<span className="font-medium">{searchTerm}</span>".
                Try a different search term or browse all items.
              </>
            )}
            {hasFiltersApplied && !searchTerm && (
              <>
                No items match your current filters.
                Try adjusting your filter criteria or clear all filters.
              </>
            )}
            {searchTerm && hasFiltersApplied && (
              <>
                No items match your search and filter criteria.
                Try different terms or clear your filters.
              </>
            )}
            {!searchTerm && !hasFiltersApplied && (
              <>
                It looks like you don't have any items to display yet.
                Check back later or contact your administrator.
              </>
            )}
          </p>
        </div>

        {(searchTerm || hasFiltersApplied) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {hasFiltersApplied && onClearFilters && (
              <Button variant="outline" onClick={onClearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
            {onShowFilters && (
              <Button variant="outline" onClick={onShowFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Adjust Filters
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Main grid content
  return (
    <div className={cn("space-y-6", className)}>
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {items.length} item{items.length !== 1 ? 's' : ''}
          {searchTerm && (
            <span> matching "<span className="font-medium">{searchTerm}</span>"</span>
          )}
          {hasFiltersApplied && (
            <span className="ml-1">
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Filtered
              </span>
            </span>
          )}
        </div>
        
        {/* View options */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-muted-foreground">
          <span>Card Size:</span>
          <span className="capitalize font-medium">{viewConfig.card_size}</span>
        </div>
      </div>

      {/* Items grid */}
      <div className={getGridClasses()}>
        {items.map((item) => (
          <ItemCard
            key={item.item_code}
            item={item}
            viewConfig={viewConfig}
            onQuickQuote={onQuickQuote}
            onRequestSample={onRequestSample}
            onViewDetails={onViewDetails}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Performance hint */}
      {items.length > 50 && (
        <div className="flex items-center justify-center py-4">
          <div className="text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            💡 Showing large dataset. Consider using filters to improve performance.
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsGrid;