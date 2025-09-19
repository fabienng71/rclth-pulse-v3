
import React from 'react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FilterIcon } from 'lucide-react';

export interface MarginAnalysisHeaderProps {
  activeTab: string;
  isMobile: boolean;
  filteredCustomers: any[];
  filteredItems: any[];
  selectedYear: number;
  selectedMonth: number;
  renderFilters: () => React.ReactNode;
}

export const MarginAnalysisHeader: React.FC<MarginAnalysisHeaderProps> = ({
  activeTab,
  isMobile,
  filteredCustomers,
  filteredItems,
  selectedYear,
  selectedMonth,
  renderFilters
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Margin Analysis</h1>
          
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-1" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Adjust filters to refine the margin analysis data
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  {renderFilters()}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        {/* Display filters directly below the title */}
        {!isMobile && renderFilters()}
      </div>
    </div>
  );
};
