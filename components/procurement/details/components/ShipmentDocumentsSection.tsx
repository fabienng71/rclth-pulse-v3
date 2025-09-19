
import React from 'react';
import ShipmentDocuments from './ShipmentDocuments';
import UploadDocumentButton from '../UploadDocumentButton';

interface ShipmentDocumentsSectionProps {
  shipmentId: string;
  documentKey: number;
  onDocumentUploaded: () => void;
}

const ShipmentDocumentsSection: React.FC<ShipmentDocumentsSectionProps> = ({
  shipmentId,
  documentKey,
  onDocumentUploaded
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
        <UploadDocumentButton 
          shipmentId={shipmentId} 
          onDocumentUploaded={onDocumentUploaded}
        />
      </div>
      
      {/* Add key to force re-render on document upload */}
      <ShipmentDocuments key={documentKey} shipmentId={shipmentId} />
    </div>
  );
};

export default ShipmentDocumentsSection;
