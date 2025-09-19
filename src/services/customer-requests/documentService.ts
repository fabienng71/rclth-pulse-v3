
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { CustomerRequestDocument, ServiceResponse, ServiceResult } from './types';

// Upload document for customer request
export const uploadCustomerRequestDocument = async (
  requestId: string,
  file: File
): Promise<ServiceResponse<CustomerRequestDocument>> => {
  const { id: userId } = useAuthStore.getState().user || {};
  
  if (!userId) {
    return { data: null, error: new Error('User not authenticated') };
  }

  try {
    // Create file path with user ID folder structure
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `customer-requests/${userId}/${requestId}/${fileName}`;

    console.log('Uploading file to path:', filePath);

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('admin')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', uploadData);

    // Insert document record into the table
    const { data: docData, error: dbError } = await supabase
      .from('customer_request_documents')
      .insert({
        customer_request_id: requestId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // If database insert fails, clean up the uploaded file
      await supabase.storage.from('admin').remove([filePath]);
      throw dbError;
    }

    console.log('Document record created:', docData);
    return { data: docData as CustomerRequestDocument, error: null };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

// Fetch documents for a customer request
export const fetchCustomerRequestDocuments = async (requestId: string): Promise<ServiceResponse<CustomerRequestDocument[]>> => {
  try {
    console.log('Fetching documents for request:', requestId);
    
    const { data, error } = await supabase
      .from('customer_request_documents')
      .select('*')
      .eq('customer_request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch documents error:', error);
      throw error;
    }

    console.log('Documents fetched:', data);
    return { data: data as CustomerRequestDocument[], error: null };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

// Delete a document
export const deleteCustomerRequestDocument = async (documentId: string, filePath: string): Promise<ServiceResult> => {
  try {
    console.log('Deleting document:', documentId, filePath);
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('admin')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      throw storageError;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('customer_request_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      throw dbError;
    }

    console.log('Document deleted successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

// Get public URL for a document
export const getDocumentUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('admin')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
