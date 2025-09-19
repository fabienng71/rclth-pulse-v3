
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockItemsTable } from './StockItemsTable';
import { VendorSummary } from './VendorSummary';
import { VendorGroup } from '@/hooks/useStockData';

interface VendorSectionProps {
  vendor: VendorGroup;
  categoryName: string;
  globalExpansion?: 'expand' | 'collapse' | null;
}

export function VendorSection({ vendor, categoryName, globalExpansion }: VendorSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Respond to global expansion commands
  useEffect(() => {
    if (globalExpansion === 'expand') {
      setIsExpanded(true);
    } else if (globalExpansion === 'collapse') {
      setIsExpanded(false);
    }
  }, [globalExpansion]);

  // Don't show vendor section for search results
  if (vendor.vendor_code === 'SEARCH_RESULTS') {
    return (
      <StockItemsTable 
        title={categoryName}
        items={vendor.items}
        totalValue={vendor.total_value}
        totalItems={vendor.total_items}
        criticalItems={vendor.critical_items}
      />
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
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
            <h3 className="text-lg font-semibold">
              {vendor.vendor_name || 'Unknown Vendor'}
            </h3>
            <span className="text-sm text-muted-foreground">
              ({vendor.total_items} items)
            </span>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <VendorSummary 
            totalItems={vendor.total_items}
            totalValue={vendor.total_value}
            criticalItems={vendor.critical_items}
          />
          
          <div className="mt-4">
            <StockItemsTable 
              title=""
              items={vendor.items}
              totalValue={0} // Don't show summary again
              totalItems={0}
              criticalItems={0}
              hideSummary={true}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
