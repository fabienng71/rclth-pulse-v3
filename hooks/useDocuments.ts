
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/marketing/DocumentList';

export const useDocuments = (folder: string, refreshTrigger: number = 0) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Query the documents table for files in the specific folder
        // Use ILIKE to do a case-insensitive match that starts with the folder name
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .ilike('file_path', `${folder}/%`);
          
        if (error) throw error;
        
        setDocuments(data as Document[]);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [folder, refreshTrigger]);

  return { documents, isLoading, error };
};
