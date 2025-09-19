import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { batchUpdateItems, batchDeleteItems, exportItemsToCSV } from '@/services/batchItemService';

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

interface UseItemsBatchOperationsProps {
  onSuccess: () => void;
  clearSelection: () => void;
  closeBatchDialog: () => void;
}

export const useItemsBatchOperations = ({ 
  onSuccess, 
  clearSelection, 
  closeBatchDialog 
}: UseItemsBatchOperationsProps) => {
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const { toast } = useToast();

  const handleBatchDelete = async (selectedItems: string[]) => {
    if (selectedItems.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} selected items? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setIsBatchProcessing(true);
    try {
      const result = await batchDeleteItems(selectedItems);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        clearSelection();
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected items",
        variant: "destructive",
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchExport = async (selectedItems: string[]) => {
    if (selectedItems.length === 0) return;

    setIsBatchProcessing(true);
    try {
      const result = await exportItemsToCSV(selectedItems);
      
      if (result.success && result.csvData) {
        const blob = new Blob([result.csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `items_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export selected items",
        variant: "destructive",
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchEditSubmit = async (
    selectedItems: string[],
    data: BatchEditData, 
    options: BatchEditOptions
  ) => {
    try {
      const result = await batchUpdateItems(selectedItems, data, options);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        clearSelection();
        closeBatchDialog();
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    isBatchProcessing,
    handleBatchDelete,
    handleBatchExport,
    handleBatchEditSubmit,
  };
};