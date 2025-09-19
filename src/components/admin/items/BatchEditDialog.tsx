import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BatchEditField, ProgressDisplay, ResultAlert, useBatchEdit, BatchEditData, BatchEditOptions } from './batch-edit';

interface BatchEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: string[];
  onBatchEdit: (data: BatchEditData, options: BatchEditOptions) => Promise<void>;
}

export const BatchEditDialog: React.FC<BatchEditDialogProps> = ({
  open,
  onOpenChange,
  selectedItems,
  onBatchEdit
}) => {
  const {
    isProcessing,
    progress,
    result,
    editData,
    editOptions,
    setEditData,
    setEditOptions,
    handleSubmit,
    handleClose,
  } = useBatchEdit(selectedItems, onBatchEdit, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Edit Items</DialogTitle>
          <DialogDescription>
            Update {selectedItems.length} selected items. Only checked fields will be updated.
          </DialogDescription>
        </DialogHeader>

        <ResultAlert result={result} />

        {isProcessing && <ProgressDisplay progress={progress} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Select the fields you want to update and provide the new values. Only checked fields will be modified across all selected items.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <BatchEditField
              id="description"
              label="Description"
              value={editData.description || ''}
              checked={editOptions.updateDescription}
              onValueChange={(value) => setEditData(prev => ({ ...prev, description: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updateDescription: checked }))}
            />

            <BatchEditField
              id="posting_group"
              label="Posting Group"
              value={editData.posting_group || ''}
              checked={editOptions.updatePostingGroup}
              onValueChange={(value) => setEditData(prev => ({ ...prev, posting_group: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updatePostingGroup: checked }))}
            />

            <BatchEditField
              id="base_unit_code"
              label="Base Unit Code"
              value={editData.base_unit_code || ''}
              checked={editOptions.updateBaseUnitCode}
              onValueChange={(value) => setEditData(prev => ({ ...prev, base_unit_code: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updateBaseUnitCode: checked }))}
            />

            <BatchEditField
              id="unit_price"
              label="Unit Price"
              type="number"
              step="0.01"
              min="0"
              value={editData.unit_price || 0}
              checked={editOptions.updateUnitPrice}
              onValueChange={(value) => setEditData(prev => ({ ...prev, unit_price: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updateUnitPrice: checked }))}
            />

            <BatchEditField
              id="vendor_code"
              label="Vendor Code"
              value={editData.vendor_code || ''}
              checked={editOptions.updateVendorCode}
              onValueChange={(value) => setEditData(prev => ({ ...prev, vendor_code: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updateVendorCode: checked }))}
            />

            <BatchEditField
              id="brand"
              label="Brand"
              value={editData.brand || ''}
              checked={editOptions.updateBrand}
              onValueChange={(value) => setEditData(prev => ({ ...prev, brand: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updateBrand: checked }))}
            />

            <BatchEditField
              id="attribut_1"
              label="Attribute 1"
              value={editData.attribut_1 || ''}
              checked={editOptions.updateAttribut1}
              onValueChange={(value) => setEditData(prev => ({ ...prev, attribut_1: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updateAttribut1: checked }))}
            />

            <BatchEditField
              id="pricelist"
              label="Include in Pricelist"
              type="switch"
              value={editData.pricelist || false}
              checked={editOptions.updatePricelist}
              onValueChange={(value) => setEditData(prev => ({ ...prev, pricelist: value }))}
              onCheckedChange={(checked) => setEditOptions(prev => ({ ...prev, updatePricelist: checked }))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing || !Object.values(editOptions).some(v => v)}
            >
              {isProcessing ? 'Updating...' : `Update ${selectedItems.length} Items`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};