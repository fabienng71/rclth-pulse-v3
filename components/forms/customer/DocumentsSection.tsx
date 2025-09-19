
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomerRequestFormValues } from './schema';
import { FileUpload } from './FileUpload';
import { useToast } from '@/components/ui/use-toast';
import { 
  uploadCustomerRequestDocument, 
  deleteCustomerRequestDocument, 
  fetchCustomerRequestDocuments,
  CustomerRequestDocument 
} from '@/services/customer-requests';

interface DocumentsSectionProps {
  requestId?: string;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ requestId }) => {
  const form = useFormContext<CustomerRequestFormValues>();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<CustomerRequestDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const documentTypes = [
    { id: 'pp20', label: 'PP20' },
    { id: 'company_registration', label: 'Company Registration' },
    { id: 'id_card', label: 'ID Card' },
  ];

  useEffect(() => {
    if (requestId) {
      loadDocuments();
    }
  }, [requestId]);

  const loadDocuments = async () => {
    if (!requestId) return;
    
    console.log('Loading documents for request:', requestId);
    
    try {
      const { data, error } = await fetchCustomerRequestDocuments(requestId);
      if (error) {
        console.error('Error loading documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } else if (data) {
        console.log('Documents loaded:', data);
        setDocuments(data);
      }
    } catch (error) {
      console.error('Unexpected error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!requestId) {
      toast({
        title: "Error",
        description: "Please save the request first before uploading documents",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "File type not supported. Please upload PDF, Word documents, or images.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting file upload for request:', requestId);
    setIsUploading(true);
    
    try {
      const { data, error } = await uploadCustomerRequestDocument(requestId, file);
      
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      if (data) {
        console.log('Upload successful:', data);
        setDocuments(prev => [data, ...prev]);
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId: string, filePath: string) => {
    console.log('Deleting document:', documentId);
    
    try {
      const { success, error } = await deleteCustomerRequestDocument(documentId, filePath);
      
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      if (success) {
        console.log('Document deleted successfully');
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      }
    } catch (error) {
      console.error('Document deletion failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Documents</h3>
      
      <div className="space-y-4">
        <div className="space-y-4">
          {documentTypes.map((doc) => (
            <FormField
              key={doc.id}
              control={form.control}
              name={
                doc.id === 'pp20' 
                  ? 'documents.pp20' as const
                  : doc.id === 'company_registration' 
                    ? 'documents.company_registration' as const
                    : 'documents.id_card' as const
              }
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      {doc.label}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-4">Supporting Documents</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upload additional documents to support your customer request (PDF, Word, or Images up to 10MB)
          </p>
          {!requestId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
              <p className="text-sm text-yellow-800">
                Save the request as a draft first to enable document uploads
              </p>
            </div>
          )}
          <FileUpload
            onFileUpload={handleFileUpload}
            documents={documents}
            onDocumentDelete={handleDocumentDelete}
            isUploading={isUploading}
            disabled={!requestId}
          />
        </div>
      </div>
    </div>
  );
};
