import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CategorySection } from '@/components/marketing/CategorySection';
import { GoogleSheetsSyncDialog } from '@/components/marketing/GoogleSheetsSyncDialog';
import { StockFilterToggles } from '@/components/marketing/StockFilterToggles';
import { useStockData } from '@/hooks/useStockData';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';

const StockOnHandPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [globalExpansion, setGlobalExpansion] = useState<'expand' | 'collapse' | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const { 
    groupedItems, 
    isLoading, 
    error, 
    refetch, 
    searchTerm, 
    setSearchTerm,
    stockFilters,
    setStockFilters
  } = useStockData();

  const handleExpandAll = () => {
    setGlobalExpansion('expand');
    setTimeout(() => setGlobalExpansion(null), 100);
  };

  const handleCollapseAll = () => {
    setGlobalExpansion('collapse');
    setTimeout(() => setGlobalExpansion(null), 100);
  };

  const handleSyncComplete = () => {
    // Refetch the stock data after successful sync
    refetch();
  };

  // Calculate total items for context
  const hasActiveFilters = stockFilters.hideZeroStock || stockFilters.showOnlyCriticalAndLow || stockFilters.showOnlyPricelist;
  const totalItemsBeforeFilters = searchTerm ? 0 : (Object.keys(groupedItems).length === 0 && !searchTerm && !hasActiveFilters ? 0 : Object.values(groupedItems).reduce((sum, category) => sum + category.total_items, 0));

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Stock on Hand</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view current inventory levels with consumption analysis
              {hasActiveFilters && (
                <span className="ml-2 text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Filtered View
                </span>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
              <Button 
                variant="default" 
                onClick={() => setSyncDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sync Data
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/crm')}
            >
              Back to CRM
            </Button>
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="mb-4">
          <StockFilterToggles 
            filters={stockFilters}
            onFiltersChange={setStockFilters}
          />
        </div>
        
        {/* Search and Expand Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by item code, description, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandAll}
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseAll}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              Collapse All
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10 text-red-500">
                <p>Error loading stock data. Please try again later.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : Object.keys(groupedItems).length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <Boxes className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  {searchTerm || stockFilters.hideZeroStock || stockFilters.showOnlyCriticalAndLow || stockFilters.showOnlyPricelist
                    ? 'No items match your filters' 
                    : 'No Stock Data Available'}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm || stockFilters.hideZeroStock || stockFilters.showOnlyCriticalAndLow || stockFilters.showOnlyPricelist
                    ? 'Try adjusting your search terms or filters to see more items.'
                    : 'Upload your inventory data using the "Sync Data" button.'}
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  )}
                  {(stockFilters.hideZeroStock || stockFilters.showOnlyCriticalAndLow || stockFilters.showOnlyPricelist) && (
                    <Button 
                      variant="outline" 
                      onClick={() => setStockFilters({ hideZeroStock: false, showOnlyCriticalAndLow: false, showOnlyPricelist: false })}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedItems).map(([categoryKey, categoryData]) => (
            <CategorySection 
              key={categoryKey}
              categoryKey={categoryKey}
              categoryData={categoryData}
              globalExpansion={globalExpansion}
              hasActiveFilters={hasActiveFilters}
            />
          ))
        )}
      </div>

      <GoogleSheetsSyncDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        onSyncComplete={handleSyncComplete}
      />
    </div>
  );
};

export default StockOnHandPage;
