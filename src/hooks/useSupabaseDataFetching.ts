import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseDataFetching = () => {
  const [oysterData, setOysterData] = useState<string | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});

  const interceptSupabaseResponse = async () => {
    try {
      // Create a custom request to capture headers
      const response = await fetch('https://cgvjcsevidvxabtwdkdv.supabase.co/rest/v1/items?select=item_code,description&item_code=eq.IFC0WW0000155&limit=1', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmpjc2V2aWR2eGFidHdka2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1Nzg5MTcsImV4cCI6MjA1OTE1NDkxN30.r8BQC5nOWdbvwcg2k0MD1OVn8JoNtr7TCpKwuYBDAEc',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmpjc2V2aWR2eGFidHdka2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1Nzg5MTcsImV4cCI6MjA1OTE1NDkxN30.r8BQC5nOWdbvwcg2k0MD1OVn8JoNtr7TCpKwuYBDAEc`,
          'Accept': 'application/json'
        }
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      setResponseHeaders(headers);

      const data = await response.json();
      if (data && data.length > 0) {
        setOysterData(data[0].description);
      }
    } catch (error) {
      console.error('Failed to intercept response:', error);
      // Fallback to regular Supabase client
      const { data, error: supabaseError } = await supabase
        .from('items')
        .select('item_code, description')
        .eq('item_code', 'IFC0WW0000155')
        .single();
      
      if (!supabaseError && data) {
        setOysterData(data.description);
      }
    }
  };

  return {
    oysterData,
    responseHeaders,
    setOysterData,
    setResponseHeaders,
    interceptSupabaseResponse,
  };
};