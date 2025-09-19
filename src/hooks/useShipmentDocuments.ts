
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface ShipmentDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  description?: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export const useShipmentDocuments = (shipmentId: string | undefined) => {
  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, isAdmin } = useAuthStore();

  // Use useCallback to prevent infinite loop in components using this hook
  const refreshDocuments = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const deleteDocument = async (documentId: string) => {
    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    try {
      // Get the document to check upload permissions and get file path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path, uploaded_by')
        .eq('id', documentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Check if user can delete: must be the uploader or an admin
      if (document.uploaded_by !== user.id && !isAdmin) {
        return { 
          success: false, 
          error: new Error('You do not have permission to delete this document') 
        };
      }
      
      // Extract the storage path from the URL
      // The file_path will be a public URL like https://...supabase.co/storage/v1/object/public/shipment-documents/shipmentId/filename.pdf
      const urlParts = document.file_path.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const storagePath = `${shipmentId}/${fileName}`;
      
      console.log('Attempting to delete file from storage:', storagePath);
      
      // Delete from storage first with more robust error handling
      const { error: storageError, data: storageData } = await supabase.storage
        .from('shipment-documents')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // For robust error handling, but we'll continue to delete from database
        console.warn('Continuing to delete from database despite storage error');
      } else {
        console.log('File successfully deleted from storage:', storageData);
      }
      
      console.log('Now deleting from database, document ID:', documentId);
      
      // Instead of using RPC, use a direct delete operation
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (deleteError) {
        console.error('Database deletion error:', deleteError);
        throw deleteError;
      }
      
      // Double-check for deletion with a delay to ensure it propagates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: checkDocument } = await supabase
        .from('documents')
        .select('id')
        .eq('id', documentId)
        .single();
        
      if (checkDocument) {
        console.error('Document still exists in database after deletion attempt');
        throw new Error('Failed to delete document from database');
      }
      
      // Update the local state to immediately reflect the deletion
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== documentId)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting document:', err);
      // Force refresh to ensure UI is in sync with database
      refreshDocuments();
      return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!shipmentId) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Make sure we're getting the latest data by using .order('uploaded_at', { ascending: false })
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('shipment_id', shipmentId)
          .order('uploaded_at', { ascending: false });
          
        if (fetchError) throw fetchError;
        
        setDocuments(data as ShipmentDocument[]);
      } catch (err) {
        console.error('Error fetching shipment documents:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [shipmentId, refreshTrigger]);

  return { documents, isLoading, error, refreshDocuments, deleteDocument };
};
