
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShipmentNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="rounded-md border p-8 flex flex-col items-center justify-center">
      <p className="text-lg font-medium">Shipment not found</p>
      <Button onClick={() => navigate('/procurement')} className="mt-4" variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shipments
      </Button>
    </div>
  );
};

export default ShipmentNotFound;
