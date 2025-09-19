
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const useDebugDatabase = () => {
  const [debugging, setDebugging] = useState(false);
  const { user } = useAuthStore();

  const runDatabaseDiagnostics = async () => {
    setDebugging(true);
    console.log('=== COMPREHENSIVE DATABASE DIAGNOSTICS ===');
    
    try {
      // 1. Test basic authentication
      console.log('1. Authentication Status:');
      console.log('User:', user);
      console.log('Auth session:', await supabase.auth.getSession());
      
      // 2. Test profiles table access
      console.log('\n2. Profiles Table Access:');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.error('Profiles access failed:', profilesError);
      } else {
        console.log('✓ Profiles table accessible');
      }
      
      // 3. Test vendors table access
      console.log('\n3. Vendors Table Access:');
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('vendor_code')
        .limit(1);
      
      if (vendorsError) {
        console.error('Vendors access failed:', vendorsError);
      } else {
        console.log('✓ Vendors table accessible');
      }
      
      // 4. Test forecast_sessions table access
      console.log('\n4. Forecast Sessions Table Access:');
      const { data: sessionsData, error: sessionsError } = await (supabase as any)
        .from('forecast_sessions')
        .select('*')
        .limit(1);
      
      if (sessionsError) {
        console.error('Forecast sessions access failed:', sessionsError);
        console.error('Error details:', {
          code: sessionsError.code,
          message: sessionsError.message,
          details: sessionsError.details,
          hint: sessionsError.hint
        });
      } else {
        console.log('✓ Forecast sessions table accessible');
      }
      
      // 5. Test sales_forecasts table access
      console.log('\n5. Sales Forecasts Table Access:');
      const { data: salesData, error: salesError } = await (supabase as any)
        .from('sales_forecasts')
        .select('*')
        .limit(1);
      
      if (salesError) {
        console.error('Sales forecasts access failed:', salesError);
      } else {
        console.log('✓ Sales forecasts table accessible');
      }
      
      // 6. Test RLS policies by attempting direct operations
      if (user) {
        console.log('\n6. RLS Policy Testing:');
        
        // Test forecast_sessions insert permission
        const testSessionData = {
          session_name: 'RLS Test Session',
          vendor_code: 'TEST_VENDOR',
          created_by: user.id,
          status: 'active'
        };
        
        const { data: testInsert, error: testInsertError } = await (supabase as any)
          .from('forecast_sessions')
          .insert(testSessionData)
          .select()
          .single();
        
        if (testInsertError) {
          console.error('RLS test insert failed:', testInsertError);
          
          if (testInsertError.code === '42501') {
            console.error('❌ RLS Policy blocking insert - insufficient permissions');
          } else if (testInsertError.code === '23503') {
            console.error('❌ Foreign key constraint violation');
          }
        } else {
          console.log('✓ RLS policies allow insert');
          
          // Clean up test data
          await (supabase as any)
            .from('forecast_sessions')
            .delete()
            .eq('id', testInsert.id);
        }
      }
      
      // 7. Check current user permissions
      console.log('\n7. Current User Permissions:');
      if (user) {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (userProfileError) {
          console.error('User profile fetch failed:', userProfileError);
        } else {
          console.log('User profile:', userProfile);
          console.log('User role:', userProfile.role);
        }
      }
      
      console.log('\n=== DIAGNOSTICS COMPLETE ===');
      
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setDebugging(false);
    }
  };

  const testDirectSQLInsertion = async () => {
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    console.log('=== TESTING DIRECT SQL INSERTION ===');
    
    try {
      // Use type assertion to bypass TypeScript restriction
      const { data, error } = await (supabase as any).rpc('test_forecast_session_insert', {
        p_session_name: 'Direct SQL Test',
        p_vendor_code: 'TEST',
        p_created_by: user.id
      });
      
      if (error) {
        console.error('Direct SQL test failed:', error);
      } else {
        console.log('✓ Direct SQL insertion successful:', data);
      }
    } catch (error) {
      console.error('SQL function test failed:', error);
    }
  };

  return {
    debugging,
    runDatabaseDiagnostics,
    testDirectSQLInsertion
  };
};
