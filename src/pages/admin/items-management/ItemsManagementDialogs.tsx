import React from 'react';
import { ItemsUploadDialog } from '@/components/admin/items/ItemsUploadDialog';
import { BatchEditDialog } from '@/components/admin/items/BatchEditDialog';
import { ItemsStockSyncDialog } from '@/components/admin/items/ItemsStockSyncDialog';

interface BatchEditData {
  description?: string;
  posting_group?: string;
  base_unit_code?: string;
  unit_price?: number;
  vendor_code?: string;
  brand?: string;
  attribut_1?: string;
  pricelist?: boolean;
}

interface BatchEditOptions {
  updateDescription: boolean;
  updatePostingGroup: boolean;
  updateBaseUnitCode: boolean;
  updateUnitPrice: boolean;
  updateVendorCode: boolean;
  updateBrand: boolean;
  updateAttribut1: boolean;
  updatePricelist: boolean;
}

interface ItemsManagementDialogsProps {
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: (open: boolean) => void;
  onUploadComplete: () => void;
  
  isBatchEditDialogOpen: boolean;
  setIsBatchEditDialogOpen: (open: boolean) => void;
  selectedItems: string[];
  onBatchEditSubmit: (data: BatchEditData, options: BatchEditOptions) => Promise<void>;
  
  isSyncDialogOpen: boolean;
  setIsSyncDialogOpen: (open: boolean) => void;
}

export const ItemsManagementDialogs: React.FC<ItemsManagementDialogsProps> = ({
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  onUploadComplete,
  
  isBatchEditDialogOpen,
  setIsBatchEditDialogOpen,
  selectedItems,
  onBatchEditSubmit,
  
  isSyncDialogOpen,
  setIsSyncDialogOpen
}) => {
  return (
    <>
      {/* Upload Dialog */}
      <ItemsUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadComplete={onUploadComplete}
      />

      {/* Batch Edit Dialog */}
      <BatchEditDialog
        open={isBatchEditDialogOpen}
        onOpenChange={setIsBatchEditDialogOpen}
        selectedItems={selectedItems}
        onBatchEdit={onBatchEditSubmit}
      />

      {/* Stock Sync Dialog */}
      <ItemsStockSyncDialog
        open={isSyncDialogOpen}
        onOpenChange={setIsSyncDialogOpen}
      />
    </>
  );
};