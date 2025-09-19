import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface ForecastSession {
  id: string;
  session_name: string;
  vendor_code: string;
  eta_date: string | null;
  status: 'active' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
  creator_name?: string;
  creator_email?: string;
}

export interface CollaborativeForecastData {
  session_id: string;
  session_name: string;
  vendor_code: string;
  eta_date: string | null;
  session_status: string;
  created_by: string;
  creator_email: string;
  creator_name: string;
  forecast_id: string | null;
  item_code: string | null;
  item_description: string | null;
  forecast_quantity: number | null;
  item_notes: string | null;
  salesperson_id: string | null;
  contributor_email: string | null;
  contributor_name: string | null;
  forecast_created_at: string | null;
}

export const useForecastSessions = () => {
  const [sessions, setSessions] = useState<ForecastSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('=== Fetching forecast sessions ===');
      
      // First fetch sessions without the problematic join
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('forecast_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Sessions fetch error:', sessionsError);
        throw sessionsError;
      }

      console.log('Raw session data:', sessionsData);

      // Then fetch creator profiles separately with proper typing
      const validCreatedByIds = (sessionsData || [])
        .map((s: any) => s.created_by)
        .filter((id: any): id is string => typeof id === 'string' && id.length > 0);
      
      // Explicitly type as string[] and ensure uniqueness
      const creatorIds: string[] = Array.from(new Set(validCreatedByIds));
      
      let profileMap: Record<string, any> = {};

      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', creatorIds);

        if (!profilesError && profilesData) {
          profileMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      // Combine the data
      const transformedSessions: ForecastSession[] = (sessionsData || []).map((session: any) => {
        const creator = profileMap[session.created_by];
        return {
          id: session.id,
          session_name: session.session_name,
          vendor_code: session.vendor_code,
          eta_date: session.eta_date,
          status: session.status,
          created_by: session.created_by,
          created_at: session.created_at,
          updated_at: session.updated_at,
          notes: session.notes,
          creator_name: creator?.full_name,
          creator_email: creator?.email
        };
      });

      console.log('Transformed sessions:', transformedSessions);
      setSessions(transformedSessions);
    } catch (err) {
      console.error('Error fetching forecast sessions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: {
    session_name: string;
    vendor_code: string;
    eta_date?: string;
    notes?: string;
  }) => {
    if (!user) {
      const error = new Error('User not authenticated');
      console.error('Create session error:', error);
      throw error;
    }

    console.log('=== Creating Session Debug ===');
    console.log('Session data:', sessionData);
    console.log('Current user:', user);

    try {
      // Check if vendor exists
      const { data: vendorCheck, error: vendorError } = await supabase
        .from('vendors')
        .select('vendor_code')
        .eq('vendor_code', sessionData.vendor_code)
        .single();
      
      if (vendorError) {
        console.error('Vendor validation failed:', vendorError);
        throw new Error(`Vendor ${sessionData.vendor_code} not found: ${vendorError.message}`);
      }
      
      console.log('✓ Vendor exists:', vendorCheck);

      // Prepare insert data
      const insertData = {
        session_name: sessionData.session_name,
        vendor_code: sessionData.vendor_code,
        eta_date: sessionData.eta_date || null,
        notes: sessionData.notes || null,
        created_by: user.id,
        status: 'active' as const
      };
      
      console.log('Insert data prepared:', insertData);

      // Insert session
      const insertResult = await (supabase as any)
        .from('forecast_sessions')
        .insert(insertData)
        .select()
        .single();

      console.log('Raw insert result:', insertResult);
      const { data, error: createError } = insertResult;

      if (createError) {
        console.error('Database insert error:', createError);
        throw new Error(`Database error: ${createError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from insert operation');
      }
      
      console.log('✓ Session created successfully:', data);
      await fetchSessions(); // Refresh the sessions list
      return data;
    } catch (err) {
      console.error('Session creation failed:', err);
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<ForecastSession>) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('forecast_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      await fetchSessions();
    } catch (err) {
      console.error('Error updating session:', err);
      throw err;
    }
  };

  const archiveSession = async (sessionId: string, archive: boolean = true) => {
    try {
      const newStatus = archive ? 'archived' : 'active';
      const { error: updateError } = await (supabase as any)
        .from('forecast_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Archive session error:', updateError);
        throw updateError;
      }
      
      await fetchSessions();
    } catch (err) {
      console.error('Error archiving session:', err);
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // First delete associated forecasts
      const { error: forecastDeleteError } = await (supabase as any)
        .from('sales_forecasts')
        .delete()
        .eq('forecast_session_id', sessionId);

      if (forecastDeleteError) {
        console.error('Error deleting forecasts:', forecastDeleteError);
        throw forecastDeleteError;
      }

      // Then delete the session
      const { error: sessionDeleteError } = await (supabase as any)
        .from('forecast_sessions')
        .delete()
        .eq('id', sessionId);

      if (sessionDeleteError) {
        console.error('Error deleting session:', sessionDeleteError);
        throw sessionDeleteError;
      }

      await fetchSessions();
    } catch (err) {
      console.error('Error deleting session:', err);
      throw err;
    }
  };

  const getCollaborativeData = async (sessionId: string): Promise<CollaborativeForecastData[]> => {
    try {
      // Get the collaborative forecast data
      const { data: collaborativeData, error: fetchError } = await (supabase as any)
        .from('collaborative_forecast_view')
        .select('*')
        .eq('session_id', sessionId);

      if (fetchError) {
        console.error('Collaborative data fetch error:', fetchError);
        throw fetchError;
      }

      if (!collaborativeData || collaborativeData.length === 0) {
        return [];
      }

      // Get unique item codes that need descriptions - with proper type filtering
      const validCreatedByIds = (collaborativeData || [])
        .map((s: any) => s.created_by)
        .filter((id: any): id is string => typeof id === 'string' && id.length > 0);
      
      // Explicitly type as string[] and ensure uniqueness
      const itemCodes: string[] = Array.from(new Set(
        collaborativeData
          .filter((item: any) => item.item_code && typeof item.item_code === 'string' && (!item.item_description || item.item_description === ''))
          .map((item: any) => item.item_code as string)
      ));

      // If we have item codes without descriptions, fetch them directly
      let itemDescriptions: Record<string, string> = {};
      if (itemCodes.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('item_code, description')
          .in('item_code', itemCodes);

        if (!itemsError && itemsData) {
          itemDescriptions = itemsData.reduce((acc: Record<string, string>, item: any) => {
            acc[item.item_code] = item.description || '';
            return acc;
          }, {});
        }
      }

      // Merge descriptions into collaborative data
      const enrichedData = collaborativeData.map((item: any) => ({
        ...item,
        item_description: item.item_description || itemDescriptions[item.item_code] || ''
      }));

      return enrichedData as CollaborativeForecastData[];
    } catch (err) {
      console.error('Error fetching collaborative data:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    archiveSession,
    deleteSession,
    getCollaborativeData
  };
};
