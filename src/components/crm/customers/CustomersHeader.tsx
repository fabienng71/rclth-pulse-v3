
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { CustomerWithAnalytics } from '@/hooks/useCustomersWithAnalytics';

interface CustomersHeaderProps {
  customers: CustomerWithAnalytics[];
  onCustomerCreated?: () => void;
}

export const CustomersHeader: React.FC<CustomersHeaderProps> = ({ 
  customers, 
  onCustomerCreated 
}) => {
  const navigate = useNavigate();

  const handleCreateCustomer = () => {
    navigate('/crm/customers/create');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            {customers.length} customers in your database
          </p>
        </div>
      </div>
      
      <Button onClick={handleCreateCustomer}>
        <Plus className="mr-2 h-4 w-4" />
        Add Customer
      </Button>
    </div>
  );
};
