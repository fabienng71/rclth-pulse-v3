
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, CheckSquare } from 'lucide-react';
import { useShipments } from '@/hooks/useShipments';
import ShipmentTable from '@/components/procurement/ShipmentTable';

const ShipmentListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Read URL parameters
  const archivedParam = searchParams.get('archived') === 'true';
  const filterParam = searchParams.get('filter');
  
  // Use normal filtering behavior (not fetchAll) for the shipment list
  const { 
    shipments, 
    loading, 
    error, 
    refetch, 
    showArchived, 
    toggleShowArchived,
    setInitialArchived,
    weekFilter,
    setWeekFilter
  } = useShipments(false);

  // Set initial state based on URL parameters
  useEffect(() => {
    if (archivedParam && !showArchived) {
      setInitialArchived(true);
    }
    if (filterParam === 'this-week' && weekFilter !== 'this-week') {
      setWeekFilter('this-week');
    }
  }, [archivedParam, filterParam, showArchived, weekFilter, setInitialArchived, setWeekFilter]);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Shipment Management</h1>
                <p className="text-muted-foreground text-xl">View and manage all shipments</p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/procurement/shipments/todo-list')}
                  className="gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  Monthly To-Do
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card variant="enhanced">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">
                {weekFilter === 'this-week' ? 'This Week\'s Shipments' :
                 showArchived ? 'Archived Shipments' : 'All Shipments'}
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              {weekFilter === 'this-week' 
                ? "Shipments expected to arrive this week"
                : showArchived 
                  ? "Viewing archived shipments" 
                  : "View and manage all incoming and outgoing shipments"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-red-800">Error loading shipments: {error.message}</p>
              </div>
            ) : (
              <ShipmentTable 
                shipments={shipments} 
                loading={loading} 
                refetch={refetch}
                showArchived={showArchived}
                toggleArchived={toggleShowArchived}
                weekFilter={weekFilter}
                setWeekFilter={setWeekFilter}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShipmentListPage;
