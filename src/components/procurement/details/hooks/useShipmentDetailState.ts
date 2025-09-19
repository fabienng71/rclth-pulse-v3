
import { useState } from 'react';
import { ShipmentItem } from '@/hooks/useShipmentDetails';

export function useShipmentDetailState() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentKey, setDocumentKey] = useState(0); // Key to force re-render
  const [editingItems, setEditingItems] = useState(false);
  const [editingShipment, setEditingShipment] = useState(false);

  // Function to refresh document component
  const handleDocumentUploaded = () => {
    setDocumentKey(prevKey => prevKey + 1);
  };

  const handleCancelEdit = () => {
    setEditingItems(false);
  };

  const handleCancelShipmentEdit = () => {
    setEditingShipment(false);
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    documentKey,
    handleDocumentUploaded,
    editingItems,
    setEditingItems,
    editingShipment,
    setEditingShipment,
    handleCancelEdit,
    handleCancelShipmentEdit
  };
}
