
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

export const EmptyCustomerSelection = () => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate('/reports/customers');
  };
  
  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={handleBackClick} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Customer Details</h1>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Customers Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please go back and select one or more customers to view their purchase details.
            </p>
            <Button onClick={handleBackClick}>
              Select Customers
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
