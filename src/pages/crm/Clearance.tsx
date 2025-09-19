
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, List, Grid } from "lucide-react";
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClearanceTable } from '@/components/crm/ClearanceTable';
import { VendorAccordionGroup } from '@/components/crm/clearance/VendorAccordionGroup';
import { ClearanceActionsToolbar } from '@/components/crm/clearance/ClearanceActionsToolbar';
import { CreateClearanceDialog } from '@/components/crm/clearance/CreateClearanceDialog';
import { EditClearanceDialog } from '@/components/crm/clearance/EditClearanceDialog';
import { DeleteClearanceDialog } from '@/components/crm/clearance/DeleteClearanceDialog';
import { useClearanceData } from '@/hooks/useClearanceData';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import type { ClearanceItem } from '@/hooks/useClearanceData';

const ClearancePage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { 
    items, 
    isLoading, 
    error, 
    refetch, 
    searchTerm, 
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort
  } = useClearanceData();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClearanceItem | null>(null);
  
  // Selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // View state
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  const handleEdit = (item: ClearanceItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: ClearanceItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedItems(new Set()); // Clear selections when exiting select mode
    }
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (selected) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    const allItemIds = new Set(items.map(item => item.id));
    setSelectedItems(allItemIds);
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Clearance Items</h1>
            <p className="text-muted-foreground mt-1">
              Manage products requiring clearance or special attention
            </p>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Clearance
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
        
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Search by item code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grouped')}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              By Vendor
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Button>
          </div>
        </div>

        <ClearanceActionsToolbar
          isSelectMode={isSelectMode}
          onToggleSelectMode={handleToggleSelectMode}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          items={items}
        />
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10 text-red-500">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p>Error loading clearance data. Please try again later.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grouped' ? (
          <VendorAccordionGroup
            items={items}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isSelectMode={isSelectMode}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
          />
        ) : (
          <ClearanceTable 
            items={items}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isSelectMode={isSelectMode}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
          />
        )}
      </div>

      {isAdmin && (
        <CreateClearanceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      )}

      <EditClearanceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        clearanceItem={selectedItem}
      />

      <DeleteClearanceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        clearanceItem={selectedItem}
      />
    </div>
  );
};

export default ClearancePage;
