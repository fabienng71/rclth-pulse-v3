import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ItemFilterBar from '@/components/reports/ItemFilterBar';
import ItemsTable from '@/components/reports/ItemsTable';
import { useItems } from '@/hooks/useItems';
import { Button } from '@/components/ui/button';

const ItemReport = () => {
  const navigate = useNavigate();
  
  const {
    searchTerm,
    setSearchTerm,
    vendorFilter,
    setVendorFilter,
    selectedItems,
    filteredItems,
    isLoading,
    error,
    vendors,
    toggleItemSelection,
    toggleSelectAll,
    areAllSelected,
    getVendorName
  } = useItems();
  
  const handleViewDetails = () => {
    navigate('/reports/items/details', { state: { selectedItems } });
  };

  const handleBackClick = () => {
    navigate('/reports');
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBackClick} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Item Report</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              vendorFilter={vendorFilter}
              setVendorFilter={setVendorFilter}
              vendors={vendors}
              selectedItems={selectedItems}
              onViewDetails={handleViewDetails}
            />

            {error ? (
              <div className="text-destructive">Error loading items: {error.message}</div>
            ) : (
              <ItemsTable
                isLoading={isLoading}
                filteredItems={filteredItems}
                selectedItems={selectedItems}
                toggleItemSelection={toggleItemSelection}
                toggleSelectAll={toggleSelectAll}
                areAllSelected={areAllSelected}
                getVendorName={getVendorName}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ItemReport;
