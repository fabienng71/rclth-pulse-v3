

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Users, Package, Trash2 } from 'lucide-react';
import { ForecastSession, useForecastSessions, CollaborativeForecastData } from '@/hooks/useForecastSessions';
import { useSalesForecastSave } from '@/hooks/useSalesForecastSave';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { SessionActionsToolbar } from './SessionActionsToolbar';
import { SortableTableHeader } from './SortableTableHeader';
import { ContributorQuantityDisplay } from './ContributorQuantityDisplay';
import { useSortableCollaborativeTable } from '@/hooks/useSortableCollaborativeTable';

interface CollaborativeForecastTableProps {
  session: ForecastSession;
  collaborativeData: CollaborativeForecastData[];
  onSave: () => void;
  onSessionDeleted: () => void;
  onSessionClosed: () => void;
}

interface NewForecastItem {
  item_code: string;
  item_description: string;
  quantity: number;
  notes: string;
}

export const CollaborativeForecastTable: React.FC<CollaborativeForecastTableProps> = ({
  session,
  collaborativeData,
  onSave,
  onSessionDeleted,
  onSessionClosed
}) => {
  const { user } = useAuthStore();
  const { saveCollaborativeForecast } = useSalesForecastSave();
  const [newItem, setNewItem] = useState<NewForecastItem>({
    item_code: '',
    item_description: '',
    quantity: 0,
    notes: ''
  });
  const [showAddItem, setShowAddItem] = useState(false);
  const [saving, setSaving] = useState(false);

  const { sortedData, sortField, sortDirection, handleSort, sortGroupedData } = useSortableCollaborativeTable(collaborativeData);

  const isSessionCompleted = session.status === 'completed';

  // Group data by item_code for display
  const groupedData = sortedData.reduce((acc, item) => {
    if (!item.item_code) return acc;
    
    if (!acc[item.item_code]) {
      acc[item.item_code] = {
        item_code: item.item_code,
        item_description: item.item_description || '',
        forecasts: []
      };
    }
    
    if (item.forecast_id) {
      acc[item.item_code].forecasts.push({
        forecast_id: item.forecast_id,
        quantity: item.forecast_quantity || 0,
        notes: item.item_notes || '',
        contributor: item.contributor_name || item.contributor_email || 'Unknown',
        contributor_email: item.contributor_email
      });
    }
    
    return acc;
  }, {} as Record<string, CollaborativeForecastData[]>);

  const handleAddItem = async () => {
    if (!newItem.item_code || newItem.quantity <= 0) {
      toast.error('Please enter valid item code and quantity');
      return;
    }

    setSaving(true);
    try {
      await saveCollaborativeForecast(session.id, [{
        vendor_code: session.vendor_code,
        item_code: newItem.item_code,
        forecast_quantity: newItem.quantity,
        eta_date: session.eta_date,
        notes: newItem.notes,
        salesperson_id: user?.id || null
      }]);

      setNewItem({
        item_code: '',
        item_description: '',
        quantity: 0,
        notes: ''
      });
      setShowAddItem(false);
      toast.success('Forecast item added successfully');
      onSave();
    } catch (error) {
      console.error('Error adding forecast item:', error);
      toast.error('Failed to add forecast item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{session.session_name}</h3>
              <div className="text-sm text-muted-foreground">
                Vendor: {session.vendor_code} • Created by: {session.creator_name || session.creator_email}
              </div>
              {session.eta_date && (
                <div className="text-sm text-muted-foreground">
                  ETA: {new Date(session.eta_date).toLocaleDateString()}
                </div>
              )}
            </div>
            <SessionActionsToolbar 
              session={session}
              onSessionDeleted={onSessionDeleted}
              onSessionClosed={onSessionClosed}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Add New Item Section - Only show if session is active */}
      {!isSessionCompleted && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Add Forecast Item</h4>
              {!showAddItem && (
                <Button onClick={() => setShowAddItem(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              )}
            </div>
          </CardHeader>
          {showAddItem && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Item Code</label>
                  <Input
                    value={newItem.item_code}
                    onChange={(e) => setNewItem(prev => ({ ...prev, item_code: e.target.value }))}
                    placeholder="Enter item code"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newItem.item_description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, item_description: e.target.value }))}
                    placeholder="Item description"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="Forecast quantity"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddItem} disabled={saving}>
                  {saving ? (
                    <>
                      <Save className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save Item
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddItem(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Collaborative Forecast Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">Collaborative Forecasts</span>
            {isSessionCompleted && (
              <Badge variant="secondary">Read Only</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedData).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No forecast items added yet</p>
              {!isSessionCompleted && (
                <p className="text-sm">Click "Add Item" to start building the forecast</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <SortableTableHeader
                      field="item_code"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Item Code
                    </SortableTableHeader>
                    <SortableTableHeader
                      field="item_description"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Description
                    </SortableTableHeader>
                    <th className="text-left p-2 font-medium">Contributors & Quantities</th>
                    <th className="text-left p-2 font-medium">Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {sortGroupedData(groupedData).map(([itemCode, item]: [string, any]) => {
                    const totalQuantity = item.forecasts.reduce((sum: number, forecast: any) => sum + forecast.quantity, 0);
                    
                    return (
                      <tr key={itemCode} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-sm">{item.item_code}</td>
                        <td className="p-2">{item.item_description}</td>
                        <td className="p-2">
                          <ContributorQuantityDisplay forecasts={item.forecasts} />
                        </td>
                        <td className="p-2">
                          <span className="font-semibold text-lg">{totalQuantity.toLocaleString()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

