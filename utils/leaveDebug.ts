import { supabase } from '@/lib/supabase';

// Debug function to check leave management system
export const debugLeaveSystem = async () => {
  console.log('🔍 Debugging Leave Management System...');
  
  try {
    // 1. Check if tables exist
    console.log('📊 Checking if leave_requests table exists...');
    const { data: leaveRequests, error: leaveError } = await supabase
      .from('leave_requests')
      .select('count')
      .limit(1);
    
    if (leaveError) {
      console.error('❌ leave_requests table error:', leaveError);
      return { 
        success: false, 
        error: 'Database tables not found. Please run the migration first.',
        details: leaveError 
      };
    }
    
    console.log('✅ leave_requests table exists');
    
    // 2. Check current user session
    console.log('👤 Checking user session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ Session error:', sessionError);
      return { 
        success: false, 
        error: 'No active session found',
        details: sessionError 
      };
    }
    
    console.log('✅ User session active:', session.user.id);
    
    // 3. Check user profile
    console.log('📋 Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, al_credit, sl_credit, bl_credit, leave_balance')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return { 
        success: false, 
        error: 'Profile not found or missing leave credits',
        details: profileError 
      };
    }
    
    console.log('✅ User profile found:', profile);
    
    // 4. Test leave requests query
    console.log('📑 Testing leave requests query...');
    const startTime = performance.now();
    
    const { data: requests, error: requestsError } = await supabase
      .from('leave_requests')
      .select(`
        *,
        user_profile:profiles!user_id (
          full_name,
          email,
          al_credit,
          sl_credit,
          bl_credit,
          leave_balance
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    
    if (requestsError) {
      console.error('❌ Requests query error:', requestsError);
      return { 
        success: false, 
        error: 'Failed to fetch leave requests',
        details: requestsError 
      };
    }
    
    console.log(`✅ Leave requests query completed in ${queryTime.toFixed(2)}ms`);
    console.log(`📊 Found ${requests?.length || 0} leave requests`);
    
    // 5. Test database functions
    console.log('⚙️ Testing database functions...');
    
    try {
      const { data: businessDays, error: functionError } = await supabase
        .rpc('calculate_business_days', {
          start_date: '2024-01-15',
          end_date: '2024-01-17'
        });
      
      if (functionError) {
        console.warn('⚠️ Database function error:', functionError);
      } else {
        console.log('✅ Database functions working:', businessDays);
      }
    } catch (err) {
      console.warn('⚠️ Database function test failed:', err);
    }
    
    // Summary
    console.log('📊 System Health Summary:');
    console.log(`- Database tables: ✅`);
    console.log(`- User session: ✅`);
    console.log(`- User profile: ✅ (${profile.full_name})`);
    console.log(`- Leave credits: AL=${profile.al_credit}, SL=${profile.sl_credit}, BL=${profile.bl_credit}`);
    console.log(`- Query performance: ${queryTime.toFixed(2)}ms`);
    console.log(`- Total requests: ${requests?.length || 0}`);
    
    return {
      success: true,
      data: {
        profile,
        requests,
        queryTime,
        requestCount: requests?.length || 0
      }
    };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { 
      success: false, 
      error: 'Unexpected error during diagnosis',
      details: error 
    };
  }
};

// Make it available globally for console testing
(window as any).debugLeaveSystem = debugLeaveSystem;