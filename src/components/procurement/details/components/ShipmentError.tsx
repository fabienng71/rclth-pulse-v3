
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShipmentErrorProps {
  errorMessage: string;
}

const ShipmentError: React.FC<ShipmentErrorProps> = ({ errorMessage }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <p className="text-red-800">Error loading shipment details: {errorMessage}</p>
      <Button onClick={() => navigate('/procurement')} className="mt-4" variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shipments
      </Button>
    </div>
  );
};

export default ShipmentError;
