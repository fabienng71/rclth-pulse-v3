import { useState } from 'react';

interface ItemFormData {
  item_code: string;
  description: string;
  posting_group: string;
  base_unit_code: string;
  unit_price: number;
  vendor_code: string;
  brand: string;
  attribut_1: string;
  pricelist: boolean;
}

export const useItemsDialogState = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemFormData | null>(null);
  const [isBatchEditDialogOpen, setIsBatchEditDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);

  const [formData, setFormData] = useState<ItemFormData>({
    item_code: '',
    description: '',
    posting_group: '',
    base_unit_code: '',
    unit_price: 0,
    vendor_code: '',
    brand: '',
    attribut_1: '',
    pricelist: false
  });

  const handleCreateClick = () => setIsCreateDialogOpen(true);
  const handleUploadClick = () => setIsUploadDialogOpen(true);
  const handleSyncClick = () => setIsSyncDialogOpen(true);
  const handleBatchEdit = () => setIsBatchEditDialogOpen(true);

  const openEditDialog = (item: any) => {
    setEditingItem({
      item_code: item.item_code,
      description: item.description || '',
      posting_group: item.posting_group || '',
      base_unit_code: item.base_unit_code || '',
      unit_price: item.unit_price || 0,
      vendor_code: item.vendor_code || '',
      brand: item.brand || '',
      attribut_1: item.attribut_1 || '',
      pricelist: item.pricelist || false
    });
    setIsEditDialogOpen(true);
  };

  const resetFormData = () => {
    setFormData({
      item_code: '',
      description: '',
      posting_group: '',
      base_unit_code: '',
      unit_price: 0,
      vendor_code: '',
      brand: '',
      attribut_1: '',
      pricelist: false
    });
  };

  return {
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
    
    // Form data
    formData,
    setFormData,
    editingItem,
    setEditingItem,
    
    // Actions
    handleCreateClick,
    handleUploadClick,
    handleSyncClick,
    handleBatchEdit,
    openEditDialog,
    resetFormData,
  };
};