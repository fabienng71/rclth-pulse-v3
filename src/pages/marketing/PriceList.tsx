
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { ChevronLeft, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePriceListData } from '@/hooks/usePriceListData';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { CategoryCard } from './components/CategoryCard';
import { EditPriceListDialog } from './components/EditPriceListDialog';
import { exportPriceListToPdf } from './components/PdfExporter';
import { toast } from "sonner";

const PriceList = () => {
  const navigate = useNavigate();
  const { organizedItems, categoryOrder, isLoading, error, categories } = usePriceListData();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleBack = () => {
    navigate('/marketing');
  };

  const getCategoryName = (code: string) => {
    if (!categories) return code;
    const category = categories.find(c => c.posting_group === code);
    return category?.description || code;
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '-';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleExportPdf = async () => {
    if (isLoading || !organizedItems || Object.keys(organizedItems).length === 0) {
      toast.error("Cannot export empty price list");
      return;
    }
    
    try {
      toast.promise(
        exportPriceListToPdf(organizedItems, categoryOrder, categories, formatPrice),
        {
          loading: "Generating PDF...",
          success: "Price list exported successfully",
          error: "Failed to export price list"
        }
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export price list");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={handleBack} className="mr-4">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-semibold">Price List</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleExportPdf} 
              variant="outline" 
              className="gap-2"
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
              Export to PDF
            </Button>
            <Button onClick={() => setIsEditDialogOpen(true)} variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Price List
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            Error: {error.message}
          </div>
        )}
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {categoryOrder.length === 0 ? (
              <p>No products found in the price list.</p>
            ) : (
              categoryOrder.map((categoryCode) => {
                const categoryItems = organizedItems[categoryCode];
                // Ensure we have the correct structure with all required properties
                const formattedCategoryItems = {
                  main: categoryItems?.main || [],
                  roamBrand: categoryItems?.roamBrand || [],
                  iconBrand: categoryItems?.iconBrand || [],
                  sicolyBrand: categoryItems?.sicolyBrand || [],
                  moulinVironBrand: categoryItems?.moulinVironBrand || [],
                  margraBrand: categoryItems?.margraBrand || [],
                  laMarcaBrand: categoryItems?.laMarcaBrand || [],
                  moulinDuCalanquetBrand: categoryItems?.moulinDuCalanquetBrand || [],
                  huilerieBeaujolaiseBrand: categoryItems?.huilerieBeaujolaiseBrand || [],
                  isignyStemereBrand: categoryItems?.isignyStemereBrand || [],
                  truffleBrand: categoryItems?.truffleBrand || [],
                  mushroomsBrand: categoryItems?.mushroomsBrand || [],
                  lesFreresMarchand: categoryItems?.lesFreresMarchand || [],
                  caviarPerseus: categoryItems?.caviarPerseus || [],
                  huitresDavidHerve: categoryItems?.huitresDavidHerve || [],
                  qwehli: categoryItems?.qwehli || [],
                  snacking: categoryItems?.snacking || []
                };
                
                return (
                  <CategoryCard
                    key={categoryCode}
                    categoryCode={categoryCode}
                    categoryName={getCategoryName(categoryCode)}
                    organizedItems={formattedCategoryItems}
                    formatPrice={formatPrice}
                  />
                );
              })
            )}
          </>
        )}
      </div>
      
      <EditPriceListDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </div>
  );
};

export default PriceList;
