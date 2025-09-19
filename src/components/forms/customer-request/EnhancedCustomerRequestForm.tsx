
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Download, FilePen } from 'lucide-react';
import { customerRequestSchema, CustomerRequestFormValues } from '@/components/forms/customer/schema';
import { CustomerInfoSection } from '@/components/forms/customer/CustomerInfoSection';
import { CompanyInfoSection } from '@/components/forms/customer/CompanyInfoSection';
import { ClassificationSection } from '@/components/forms/customer/ClassificationSection';
import { ContactsSection } from '@/components/forms/customer/ContactsSection';
import { DocumentsSection } from '@/components/forms/customer/DocumentsSection';
import { FinancialSection } from '@/components/forms/customer/FinancialSection';
import { useCustomerRequests } from '@/hooks/useCustomerRequests';
import { generateCustomerRequestPDF } from '@/services/customer-requests/pdfService';

interface EnhancedCustomerRequestFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
  requestId?: string;
}

export const EnhancedCustomerRequestForm: React.FC<EnhancedCustomerRequestFormProps> = ({
  initialData,
  mode,
  requestId
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { submitRequest, saveDraft, isSavingDraft, isSubmitting } = useCustomerRequests();
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const form = useForm<CustomerRequestFormValues>({
    resolver: zodResolver(customerRequestSchema),
    defaultValues: {
      customer_name: initialData?.customer_name || '',
      search_name: initialData?.search_name || '',
      customer_type_code: initialData?.customer_type_code || '',
      salesperson_code: initialData?.salesperson_code || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      company_name: initialData?.company_name || '',
      company_address: initialData?.company_address || '',
      company_city: initialData?.company_city || '',
      customer_group: initialData?.customer_group || '',
      region: initialData?.region || '',
      contacts: initialData?.contacts || [],
      documents: initialData?.documents || { pp20: false, company_registration: false, id_card: false },
      credit_limit: initialData?.credit_limit || 0,
      credit_terms: initialData?.credit_terms || '',
      prepayment: initialData?.prepayment || false,
    },
  });

  const onSubmit = async (data: CustomerRequestFormValues) => {
    try {
      if (mode === 'create') {
        await submitRequest(data);
        toast({
          title: "Success",
          description: "Customer request created successfully",
        });
        navigate('/forms/customer');
      } else {
        // Handle edit mode if needed
        toast({
          title: "Success",
          description: "Customer request updated successfully",
        });
      }
    } catch (error) {
      console.error('Error submitting customer request:', error);
      toast({
        title: "Error",
        description: "Failed to submit customer request",
        variant: "destructive",
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const formData = form.getValues();
      await saveDraft(formData);
      toast({
        title: "Success",
        description: "Draft saved successfully",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const formData = form.getValues();
      
      const pdfBlob = await generateCustomerRequestPDF(formData);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customer-request-${formData.customer_name}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerInfoSection />
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyInfoSection />
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <ClassificationSection />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactsSection />
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsSection requestId={requestId} />
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialSection />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between">
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/forms/customer')}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                <FilePen className="mr-2 h-4 w-4" />
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? (isSubmitting ? 'Creating...' : 'Create Request') : 'Update Request'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
