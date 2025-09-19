import { useState } from 'react';
import { BatchEditData, BatchEditOptions } from './types';

export const useBatchEdit = (
  selectedItems: string[],
  onBatchEdit: (data: BatchEditData, options: BatchEditOptions) => Promise<void>,
  onOpenChange: (open: boolean) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string; } | null>(null);

  const [editData, setEditData] = useState<BatchEditData>({
    description: '',
    posting_group: '',
    base_unit_code: '',
    unit_price: 0,
    vendor_code: '',
    brand: '',
    attribut_1: '',
    pricelist: false
  });

  const [editOptions, setEditOptions] = useState<BatchEditOptions>({
    updateDescription: false,
    updatePostingGroup: false,
    updateBaseUnitCode: false,
    updateUnitPrice: false,
    updateVendorCode: false,
    updateBrand: false,
    updateAttribut1: false,
    updatePricelist: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one field is selected for update
    const hasSelectedFields = Object.values(editOptions).some(value => value);
    if (!hasSelectedFields) {
      setResult({
        success: false,
        message: 'Please select at least one field to update.'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await onBatchEdit(editData, editOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setResult({
        success: true,
        message: `Successfully updated ${selectedItems.length} items.`
      });

      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false);
        handleReset();
      }, 2000);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update items'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setEditData({
      description: '',
      posting_group: '',
      base_unit_code: '',
      unit_price: 0,
      vendor_code: '',
      brand: '',
      attribut_1: '',
      pricelist: false
    });
    setEditOptions({
      updateDescription: false,
      updatePostingGroup: false,
      updateBaseUnitCode: false,
      updateUnitPrice: false,
      updateVendorCode: false,
      updateBrand: false,
      updateAttribut1: false,
      updatePricelist: false
    });
    setResult(null);
    setProgress(0);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      handleReset();
    }
  };

  return {
    isProcessing,
    progress,
    result,
    editData,
    editOptions,
    setEditData,
    setEditOptions,
    handleSubmit,
    handleClose,
    handleReset,
  };
};