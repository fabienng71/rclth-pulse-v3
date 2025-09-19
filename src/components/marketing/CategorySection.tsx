
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockCategorySummary } from './StockCategorySummary';
import { VendorSection } from './VendorSection';
import { GroupedStockItems } from '@/hooks/useStockData';

interface CategorySectionProps {
  categoryKey: string;
  categoryData: GroupedStockItems[string];
  globalExpansion?: 'expand' | 'collapse' | null;
  hasActiveFilters?: boolean;
}

export function CategorySection({ categoryKey, categoryData, globalExpansion, hasActiveFilters = false }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Respond to global expansion commands
  useEffect(() => {
    if (globalExpansion === 'expand') {
      setIsExpanded(true);
    } else if (globalExpansion === 'collapse') {
      setIsExpanded(false);
    }
  }, [globalExpansion]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <CardTitle className="text-xl">
              {categoryData.category_description || categoryKey}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              ({categoryData.total_items} item{categoryData.total_items !== 1 ? 's' : ''}, {categoryData.vendors.length} vendor{categoryData.vendors.length !== 1 ? 's' : ''})
              {hasActiveFilters && (
                <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Filtered
                </span>
              )}
            </span>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <StockCategorySummary 
            totalItems={categoryData.total_items}
            totalValue={categoryData.total_value}
            criticalItems={categoryData.critical_items}
          />
          
          <div className="mt-6 space-y-4">
            {categoryData.vendors.map((vendor) => (
              <VendorSection 
                key={vendor.vendor_code || 'unknown'}
                vendor={vendor}
                categoryName={categoryData.category_description || categoryKey}
                globalExpansion={globalExpansion}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
