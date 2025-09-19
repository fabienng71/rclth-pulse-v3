import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Users, Plus, Settings, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { useShipmentDetails } from '@/hooks/useShipmentDetails';
import { useShipmentTodos } from '@/hooks/useShipmentTodos';
import { useCreateShipmentTodo } from '@/hooks/useCreateShipmentTodo';
import { useTemplateSync } from '@/hooks/useTemplateSync';
import { useAuthStore } from '@/stores/authStore';
import ShipmentTodoList from './ShipmentTodoList';
import ShipmentTodoProgress from './ShipmentTodoProgress';
import ShipmentTodoHistory from './ShipmentTodoHistory';
import TemplateSyncDialog from './TemplateSyncDialog';
import { formatDate } from '@/components/procurement/utils/shipmentUtils';

const ShipmentTodoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { shipment, loading: shipmentLoading } = useShipmentDetails(id);
  const { todo, loading: todoLoading, updateTodo, refetch } = useShipmentTodos(id);
  const { createTodoForShipment, loading: creatingTodo } = useCreateShipmentTodo();
  
  const { 
    syncResult, 
    syncLoading, 
    checkForUpdates, 
    syncWithTemplate, 
    clearSyncResult 
  } = useTemplateSync(id, todo?.checklistData, todo?.templateId);
  
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  // Check for template updates when todo loads
  useEffect(() => {
    if (todo && todo.templateId) {
      checkForUpdates();
    }
  }, [todo, checkForUpdates]);

  const handleCreateTodo = async () => {
    if (!shipment || !id) return;
    
    const success = await createTodoForShipment(id, shipment.vendor_name || 'supplier');
    if (success) {
      refetch();
    }
  };

  const handleSyncClick = () => {
    if (syncResult?.needsSync) {
      setSyncDialogOpen(true);
    }
  };

  const handleConfirmSync = async () => {
    const success = await syncWithTemplate();
    if (success) {
      setSyncDialogOpen(false);
      refetch();
    }
  };

  const canCreateTodo = shipment && ['pending', 'in_transit'].includes(shipment.status || '');

  if (!isAdmin) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/procurement')} className="mt-4">
              Back to Procurement
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (shipmentLoading || todoLoading) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Shipment Not Found</h1>
            <Button onClick={() => navigate('/procurement')} variant="outline">
              Back to Procurement
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <Button 
            onClick={() => navigate('/procurement/shipments/timeline')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Timeline
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Todo List Available</h1>
            <p className="text-muted-foreground mb-4">
              This shipment doesn't have a todo list yet.
            </p>
            <Badge variant="outline" className="mb-6">
              Status: {shipment.status || 'Unknown'}
            </Badge>
            
            {canCreateTodo ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can create a todo list for this {shipment.status} shipment using the default template.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={handleCreateTodo}
                    disabled={creatingTodo}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {creatingTodo ? 'Creating...' : 'Create Todo List'}
                  </Button>
                  <Button 
                    onClick={() => navigate('/procurement/shipments/timeline')} 
                    variant="outline"
                  >
                    Back to Timeline
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Todo lists are only available for pending and in-transit shipments.
                </p>
                <Button onClick={() => navigate('/procurement/shipments/timeline')} variant="outline">
                  Back to Timeline
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/procurement/shipments/timeline')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Timeline
          </Button>
          
          <div className="section-background p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Shipment Todo List
                </h1>
                <p className="text-muted-foreground text-xl mt-2">
                  {shipment.vendor_name}
                </p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    ETD: {formatDate(shipment.etd) || 'Not set'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    ETA: {formatDate(shipment.eta) || 'Not set'}
                  </Badge>
                  {todo.allTasksCompleted && (
                    <Badge variant="outline" className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      All Tasks Completed
                    </Badge>
                  )}
                  {todo.templateId && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      Template-based
                    </Badge>
                  )}
                  {syncResult?.needsSync && (
                    <Badge variant="destructive" className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      Template Updated
                    </Badge>
                  )}
                </div>
                
                {/* Template Sync Actions */}
                {todo.templateId && (
                  <div className="mt-4 flex items-center gap-2">
                    {syncResult?.needsSync ? (
                      <Button 
                        onClick={handleSyncClick} 
                        variant="outline" 
                        size="sm"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync with Template ({syncResult.changes.newTasks.length + syncResult.changes.modifiedTasks.length + syncResult.changes.removedTasks.length} changes)
                      </Button>
                    ) : (
                      <Button 
                        onClick={checkForUpdates} 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check for Template Updates
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <ShipmentTodoProgress 
                completionStats={todo.completionStats}
                allCompleted={todo.allTasksCompleted}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card variant="enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Todo Checklist
                  {todo.templateId && (
                    <Badge variant="outline" className="text-xs">
                      Template-based
                    </Badge>
                  )}
                  {syncResult?.needsSync && (
                    <Badge variant="destructive" className="text-xs">
                      Updates Available
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Complete all tasks to ensure smooth shipment processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShipmentTodoList 
                  checklistData={todo.checklistData}
                  onUpdate={(updatedData, taskId, sectionId, previousStatus) => 
                    updateTodo(updatedData, taskId, sectionId, previousStatus)
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                  <p className="font-medium">{shipment.vendor_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Freight Forwarder</label>
                  <p className="font-medium">{shipment.freight_forwarder || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transport Mode</label>
                  <p className="font-medium capitalize">{shipment.transport_mode || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Shipment Type</label>
                  <p className="font-medium">{shipment.shipment_type || 'Not specified'}</p>
                </div>
                {todo.templateId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Template Used</label>
                    <p className="font-medium">Template-based checklist</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <ShipmentTodoHistory taskHistory={todo.taskHistory} />
          </div>
        </div>
      </div>

      {/* Template Sync Dialog */}
      {syncResult && (
        <TemplateSyncDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
          syncResult={syncResult}
          onConfirmSync={handleConfirmSync}
          loading={syncLoading}
        />
      )}
    </div>
  );
};

export default ShipmentTodoPage;
