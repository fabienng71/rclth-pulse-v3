import React from 'react';
import { useParams } from 'react-router-dom';
import { useShipmentDetails } from '@/hooks/useShipmentDetails';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '../status/StatusBadge';
import { determineShipmentStatus } from '../utils/shipmentUtils';
import LoadingShipments from '../loading/LoadingShipments';
import ShipmentDetailsHeader from './components/ShipmentDetailsHeader';
import ShipmentItemsSection from './components/ShipmentItemsSection';
import ShipmentError from './components/ShipmentError';
import ShipmentNotFound from './components/ShipmentNotFound';
import { useShipmentItemsState } from './shipment-items/useShipmentItemsState';
import { useShipmentItemsSave } from './shipment-items/useShipmentItemsSave';
import { toast } from 'sonner';
import DeleteShipmentDialog from './DeleteShipmentDialog';
import { useShipmentDetailState } from './hooks/useShipmentDetailState';
import ShipmentInfoSection from './components/ShipmentInfoSection';
import ShipmentItemsEditSection from './components/ShipmentItemsEditSection';
import ShipmentDocumentsSection from './components/ShipmentDocumentsSection';
import { DocumentViewer } from './components/DocumentViewer';
import { useShipmentDocuments } from '@/hooks/useShipmentDocuments';
import { exportShipmentItemsToExcel } from '../utils/exportUtils';

const ShipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { shipment, items, loading, error, refetch } = useShipmentDetails(id);
  const { documents } = useShipmentDocuments(id || '');
  
  const { 
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
  } = useShipmentDetailState();

  // Initialize the shipment items state
  const {
    editableItems,
    handleAddItem,
    handleAddSearchItem,
    handleRemoveItem,
    handleItemChange
  } = useShipmentItemsState(items, id);
  
  const { saveShipmentItems } = useShipmentItemsSave();

  const handleSaveItems = async () => {
    if (!id) {
      toast.error('Missing shipment ID');
      return;
    }
    
    const success = await saveShipmentItems(id, editableItems, items, refetch);
    if (success) {
      setEditingItems(false);
    }
  };

  const handleShipmentEditSuccess = () => {
    setEditingShipment(false);
    refetch();
  };

  const handleExportPO = () => {
    if (!id || items.length === 0) {
      toast.error('No items to export');
      return;
    }
    
    try {
      exportShipmentItemsToExcel(items, id);
      toast.success('Purchase order exported successfully');
    } catch (error) {
      console.error('Error exporting PO:', error);
      toast.error('Failed to export purchase order');
    }
  };

  if (loading) {
    return <LoadingShipments />;
  }

  if (error) {
    return <ShipmentError errorMessage={error.message} />;
  }

  if (!shipment) {
    return <ShipmentNotFound />;
  }
  
  const calculatedStatus = determineShipmentStatus(shipment.etd, shipment.eta);

  return (
    <div className="space-y-6">
      <ShipmentDetailsHeader 
        shipmentId={id as string}
        onEditClick={() => setEditingShipment(true)}
        onDeleteClick={() => setDeleteDialogOpen(true)}
        onExportClick={handleExportPO}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            Shipment Details
            <div className="ml-auto">
              <StatusBadge status={calculatedStatus} />
            </div>
          </CardTitle>
          <CardDescription>
            Vendor: <span className="font-semibold">{shipment.vendor_name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShipmentInfoSection 
            shipment={shipment}
            editingShipment={editingShipment}
            onEditClick={() => setEditingShipment(true)}
            onCancelEdit={handleCancelShipmentEdit}
            onEditSuccess={handleShipmentEditSuccess}
          />
          
          {!editingItems ? (
            <ShipmentItemsSection 
              items={items} 
              onEditItems={() => setEditingItems(true)} 
            />
          ) : (
            <ShipmentItemsEditSection 
              items={items}
              editableItems={editableItems}
              onAddItem={handleAddItem}
              onAddSearchItem={handleAddSearchItem}
              onRemoveItem={handleRemoveItem}
              onItemChange={handleItemChange}
              onSaveItems={handleSaveItems}
              onCancelEdit={handleCancelEdit}
            />
          )}
        </CardContent>
      </Card>
      
      <ShipmentDocumentsSection 
        shipmentId={id as string}
        documentKey={documentKey}
        onDocumentUploaded={handleDocumentUploaded}
      />
      
      <DocumentViewer documents={documents} />
      
      <DeleteShipmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        shipmentId={id}
      />
    </div>
  );
};

export default ShipmentDetails;
