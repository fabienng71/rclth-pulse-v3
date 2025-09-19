
import { useToast } from '@/components/ui/use-toast';
import { SampleRequestFormData } from '@/services/sampleRequestService';

export const useSampleFormValidation = () => {
  const { toast } = useToast();
  
  // Form validation
  const validateForm = (formData: SampleRequestFormData): boolean => {
    console.log('Validating form data:', formData); // Debug logging
    
    if (!formData.customerCode || !formData.customerName) {
      console.log('Validation failed: Missing customer data', { 
        code: formData.customerCode, 
        name: formData.customerName 
      });
      
      toast({
        title: "Error",
        description: "Customer code and name are required",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.items.length === 0) {
      toast({
        title: "Error",
        description: "At least one item is required",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate required fields for each item
    const invalidItems = formData.items.some(
      item => !item.item_code || !item.description || !item.quantity
    );
    
    if (invalidItems) {
      toast({
        title: "Error",
        description: "All items must have a code, description, and quantity",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  return { validateForm };
};
