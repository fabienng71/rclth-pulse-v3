
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ShipmentCreationForm from '@/components/procurement/create/ShipmentCreationForm';
import { useCreateShipment } from '@/hooks/useCreateShipment';
import { toast } from 'sonner';

const CreateShipmentPage = () => {
  const navigate = useNavigate();
  const { createShipment, loading } = useCreateShipment();

  const handleSubmit = async (formData: any) => {
    console.log('Shipment form submitted with data:', formData);
    
    try {
      const success = await createShipment(formData);
      if (success) {
        // No need for duplicate toast since useCreateShipment already shows one
        navigate('/procurement');
      }
    } catch (error) {
      console.error('Error in shipment creation:', error);
      toast.error('Failed to create shipment');
    }
  };

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/procurement')} 
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shipments
          </Button>
          <div className="section-background p-6">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Create New Shipment</h1>
            <p className="text-muted-foreground text-xl">Add a new shipment to the system</p>
          </div>
        </div>

        <Card variant="enhanced">
          <CardHeader>
            <CardTitle>Shipment Information</CardTitle>
            <CardDescription>
              Enter the details for the new shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShipmentCreationForm onSubmit={handleSubmit} isLoading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateShipmentPage;
