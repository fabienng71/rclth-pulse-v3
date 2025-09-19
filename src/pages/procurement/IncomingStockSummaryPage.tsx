
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Clock, AlertTriangle } from 'lucide-react';
import { useIncomingStock } from '@/hooks/useIncomingStock';
import IncomingStockSummaryCards from '@/components/procurement/incoming-stock/IncomingStockSummaryCards';
import VendorSection from '@/components/procurement/incoming-stock/VendorSection';
import IncomingStockFilters from '@/components/procurement/incoming-stock/IncomingStockFilters';

const IncomingStockSummaryPage = () => {
  const navigate = useNavigate();
  const { vendorGroups, loading, error, searchTerm, setSearchTerm, selectedTransportMode, setSelectedTransportMode } = useIncomingStock();

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/procurement')} 
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="section-background p-6">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Incoming Stock Summary</h1>
            <p className="text-muted-foreground text-xl">Monitor pending and in-transit shipments by vendor</p>
          </div>
        </div>

        {/* Summary Cards */}
        <IncomingStockSummaryCards vendorGroups={vendorGroups} loading={loading} />

        {/* Filters */}
        <IncomingStockFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTransportMode={selectedTransportMode}
          setSelectedTransportMode={setSelectedTransportMode}
        />

        <Card variant="enhanced">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Incoming Shipments by Vendor</CardTitle>
            </div>
            <CardDescription className="text-base">
              Shipments that are pending departure or currently in transit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-red-800">Error loading incoming stock: {error.message}</p>
              </div>
            ) : vendorGroups.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Incoming Shipments</h3>
                <p className="text-muted-foreground">There are no pending or in-transit shipments at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {vendorGroups.map((vendorGroup) => (
                  <VendorSection key={vendorGroup.vendorCode} vendorGroup={vendorGroup} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomingStockSummaryPage;
