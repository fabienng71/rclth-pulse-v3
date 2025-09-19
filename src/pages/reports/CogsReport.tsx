
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCogsData } from '@/hooks/useCogsData';
import CogsTable from '@/components/reports/CogsTable';
import { useAuthStore } from '@/stores/authStore';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import ItemFilterBar from '@/components/reports/ItemFilterBar';
import { useVendorsData } from '@/hooks/useVendorsData';
import { Button } from '@/components/ui/button';

const CogsReport = () => {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const { toast } = useToast();
  const { vendors, isLoading: vendorsLoading } = useVendorsData();
  const { cogsItems, isLoading, error } = useCogsData(vendorFilter);
  
  // If user is not admin, redirect to reports page
  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to view this report.",
      variant: "destructive"
    });
    navigate('/reports');
    return null;
  }

  // Handle view history button click
  const handleViewHistory = () => {
    navigate('/reports/cogs/history');
  };
  
  // Filter items based on search term
  const filteredItems = cogsItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.item_code && item.item_code.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.base_unit_code && item.base_unit_code.toLowerCase().includes(searchLower)) ||
      (item.posting_group && item.posting_group.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold md:text-3xl">Cost of Goods Sold Report</h1>
            <Button
              variant="default" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleViewHistory}
            >
              See COGS over time
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>COGS Analysis</CardTitle>
            <CardDescription>
              View cost information and margin data for all items
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ItemFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              vendorFilter={vendorFilter}
              setVendorFilter={setVendorFilter}
              vendors={vendors}
            />
            
            <Separator className="my-4" />
            
            {error ? (
              <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
                Error loading COGS data: {error.message}
              </div>
            ) : (
              <CogsTable cogsItems={filteredItems} isLoading={isLoading || vendorsLoading} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CogsReport;
