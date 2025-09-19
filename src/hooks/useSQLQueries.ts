
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useSQLQueries = () => {
  const { user } = useAuthStore();
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!naturalLanguageQuery.trim()) {
      toast.error('Please enter a query description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSqlQuery('');
    setResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('nl-to-sql', {
        body: { 
          prompt: naturalLanguageQuery,
          user_id: user?.id
        }
      });
      
      if (error) throw error;
      
      if (data?.sql) {
        setSqlQuery(data.sql);
        toast.success('SQL query generated');
      } else {
        throw new Error('Failed to generate SQL query');
      }
    } catch (err: any) {
      console.error('Error generating SQL:', err);
      setError(err?.message || 'Failed to generate SQL query');
      toast.error('Failed to generate SQL query');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecute = async () => {
    if (!sqlQuery.trim()) {
      toast.error('No SQL query to execute');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResults(null);
    setColumns([]);
    
    try {
      console.log('Executing SQL query:', sqlQuery);
      const { data, error } = await supabase.functions.invoke('execute-sql', {
        body: { 
          sql: sqlQuery,
          user_id: user?.id
        }
      });
      
      if (error) throw error;
      
      console.log('Query execution response:', data);
      
      if (data?.results) {
        // Validate and ensure columns array is properly formed
        const validColumns = Array.isArray(data.columns) ? data.columns.filter(Boolean) : [];
        
        setResults(data.results);
        setColumns(validColumns);
        toast.success(`Query executed successfully. Found ${data.results.length} records.`);
      } else {
        console.warn('No results returned from query:', data);
        throw new Error('Failed to execute SQL query: No results returned');
      }
    } catch (err: any) {
      console.error('Error executing SQL:', err);
      setError(err?.message || 'Failed to execute SQL query');
      toast.error('Failed to execute SQL query');
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    naturalLanguageQuery,
    setNaturalLanguageQuery,
    sqlQuery,
    setSqlQuery,
    isGenerating,
    isExecuting,
    results,
    error,
    columns,
    handleGenerate,
    handleExecute
  };
};
