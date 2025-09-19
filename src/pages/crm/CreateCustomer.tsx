
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerForm, CustomerFormData } from '@/components/crm/customers/CustomerForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const { toast } = useToast();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && id) {
      loadCustomerData();
    }
  }, [isEdit, id]);

  const loadCustomerData = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_code', id)
        .single();

      if (error) {
        console.error('Error loading customer:', error);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setCustomerData({
          customer_code: data.customer_code,
          customer_name: data.customer_name,
          search_name: data.search_name || '',
          customer_type_code: data.customer_type_code || '',
          salesperson_code: data.salesperson_code || '',
        });
      }
    } catch (error: any) {
      console.error('Unexpected error loading customer:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred while loading customer data",
        variant: "destructive",
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      const customerData = {
        customer_code: data.customer_code,
        customer_name: data.customer_name,
        search_name: data.search_name || null,
        customer_type_code: data.customer_type_code || null,
        salesperson_code: data.salesperson_code || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('customer_code', id);

        if (error) {
          console.error('Error updating customer:', error);
          if (error.code === '23505') {
            toast({
              title: "Error",
              description: `Customer code "${data.customer_code}" already exists. Please use a different code.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message || "Failed to update customer",
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('customers')
          .insert(customerData);

        if (error) {
          console.error('Error creating customer:', error);
          if (error.code === '23505') {
            toast({
              title: "Error",
              description: `Customer code "${data.customer_code}" already exists. Please use a different code.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message || "Failed to create customer",
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Success",
          description: "Customer created successfully",
        });
      }

      navigate('/crm/customers');
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/crm/customers');
  };

  if (isEdit && isDataLoading) {
    return (
      <>
        <Navigation />
        <main className="container py-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading customer data...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container py-6 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isEdit ? 'Edit Customer' : 'Create New Customer'}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? 'Update customer information' : 'Add a new customer to your database'}
              </p>
            </div>
          </div>
        </div>

        <CustomerForm 
          onSubmit={handleSubmit}
          initialData={customerData || undefined}
          isEdit={isEdit}
          isLoading={isLoading}
        />
      </main>
    </>
  );
};

export default CreateCustomer;
