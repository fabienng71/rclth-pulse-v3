import React from 'react';
import Navigation from '@/components/Navigation';
import AdminGuard from '@/components/security/AdminGuard';
import { ItemsFiltersComponent } from '@/components/admin/items/ItemsFilters';
import { AdvancedCharacterDebugger } from '@/components/debug/AdvancedCharacterDebugger';
import {
  ItemsManagementHeader,
  ItemsOverviewCard,
  CreateItemDialog,
  EditItemDialog,
  ItemsManagementDialogs,
  useItemsManagementLogic
} from './items-management';

const ItemsManagement = () => {
  const {
    // Data
    filteredItems,
    isLoading,
    searchTerm,
    setSearchTerm,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    filters,

    // Form data
    formData,
    setFormData,
    editingItem,
    setEditingItem,

    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isBatchEditDialogOpen,
    setIsBatchEditDialogOpen,
    isSyncDialogOpen,
    setIsSyncDialogOpen,

    // Loading states
    isDeleting,
    isBatchProcessing,

    // Selection
    selectedItems,
    setSelectedItems,

    // Handlers
    handleCreateClick,
    handleUploadClick,
    handleSyncClick,
    handleUploadComplete,
    handleCreateItem,
    handleEditItem,
    handleDeleteItem,
    openEditDialog,
    handleBatchEdit,
    handleBatchDelete,
    handleBatchExport,
    handleBatchEditSubmit,
    handleClearSelection,
    handleFiltersChange,
  } = useItemsManagementLogic();

  return (
    <AdminGuard>
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <ItemsManagementHeader
            onCreateClick={handleCreateClick}
            onUploadClick={handleUploadClick}
            onSyncClick={handleSyncClick}
          />

          {/* Filters Section */}
          <ItemsFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />

          <ItemsOverviewCard
            filters={filters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredItems={filteredItems}
            isLoading={isLoading}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onEdit={openEditDialog}
            onDelete={handleDeleteItem}
            isDeleting={isDeleting}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onBatchEdit={handleBatchEdit}
            onBatchDelete={handleBatchDelete}
            onBatchExport={handleBatchExport}
            onClearSelection={handleClearSelection}
            isBatchProcessing={isBatchProcessing}
          />

          {/* Create Dialog */}
          <CreateItemDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateItem}
          />

          {/* Edit Dialog */}
          <EditItemDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            onSubmit={handleEditItem}
          />

          {/* Other Dialogs */}
          <ItemsManagementDialogs
            isUploadDialogOpen={isUploadDialogOpen}
            setIsUploadDialogOpen={setIsUploadDialogOpen}
            onUploadComplete={handleUploadComplete}
            isBatchEditDialogOpen={isBatchEditDialogOpen}
            setIsBatchEditDialogOpen={setIsBatchEditDialogOpen}
            selectedItems={selectedItems}
            onBatchEditSubmit={handleBatchEditSubmit}
            isSyncDialogOpen={isSyncDialogOpen}
            setIsSyncDialogOpen={setIsSyncDialogOpen}
          />
          
          {/* Advanced Character Encoding Debugger */}
          <AdvancedCharacterDebugger />
        </div>
      </div>
    </AdminGuard>
  );
};

export default ItemsManagement;