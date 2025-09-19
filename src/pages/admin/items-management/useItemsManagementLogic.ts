import { useItemsData } from '@/hooks/useItemsData';
import { useItemsDialogState } from '@/hooks/useItemsDialogState';
import { useItemsCrudOperations } from '@/hooks/useItemsCrudOperations';
import { useItemsBatchOperations } from '@/hooks/useItemsBatchOperations';
import { useItemsFiltersAndPagination } from '@/hooks/useItemsFiltersAndPagination';

export const useItemsManagementLogic = () => {
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    filters,
    selectedItems,
    setSelectedItems,
    handleFiltersChange,
    handleClearSelection,
  } = useItemsFiltersAndPagination();

  const { items, filteredItems, isLoading, refetch, searchTerm, setSearchTerm, totalCount, totalPages } = useItemsData({ 
    page: currentPage, 
    pageSize,
    filters 
  });

  const {
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
    formData,
    setFormData,
    editingItem,
    setEditingItem,
    handleCreateClick,
    handleUploadClick,
    handleSyncClick,
    handleBatchEdit,
    openEditDialog,
    resetFormData,
  } = useItemsDialogState();

  const {
    isDeleting,
    handleCreateItem: handleCreateItemCore,
    handleEditItem: handleEditItemCore,
    handleDeleteItem,
  } = useItemsCrudOperations({
    onSuccess: refetch,
    onCreateSuccess: () => setIsCreateDialogOpen(false),
    resetFormData,
  });

  const {
    isBatchProcessing,
    handleBatchDelete,
    handleBatchExport,
    handleBatchEditSubmit,
  } = useItemsBatchOperations({
    onSuccess: refetch,
    clearSelection: () => setSelectedItems([]),
    closeBatchDialog: () => setIsBatchEditDialogOpen(false),
  });

  const handleUploadComplete = () => refetch();

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateItemCore(formData);
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    await handleEditItemCore(editingItem);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleBatchEditSubmitWrapper = async (data: any, options: any) => {
    await handleBatchEditSubmit(selectedItems, data, options);
  };

  return {
    // Data
    items,
    filteredItems,
    isLoading,
    searchTerm,
    setSearchTerm,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    filters,
    refetch,

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
    handleBatchEditSubmit: handleBatchEditSubmitWrapper,
    handleClearSelection,
    handleFiltersChange,
  };
};