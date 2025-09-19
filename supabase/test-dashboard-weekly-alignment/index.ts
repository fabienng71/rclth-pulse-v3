import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test 1: Weekly function for Week 36
    const { data: weeklyData, error: weeklyError } = await supabase.rpc('get_weekly_turnover_data', {
      p_year: 2025,
      p_week: 36,
      p_salesperson_code: null,
      p_is_admin: true
    })

    if (weeklyError) {
      throw new Error(`Weekly function error: ${weeklyError.message}`)
    }

    // Test 2: Dashboard function for September 
    const { data: dashboardData, error: dashboardError } = await supabase.rpc('get_accurate_monthly_turnover', {
      from_date: '2025-09-01',
      to_date: '2025-09-30', 
      is_admin: true,
      user_spp_code: ''
    })

    if (dashboardError) {
      throw new Error(`Dashboard function error: ${dashboardError.message}`)
    }

    // Extract values
    const weeklyTurnover = weeklyData?.[0]?.current_week_turnover || 0
    const septemberData = dashboardData?.find((item: any) => item.month === '2025-09')
    const dashboardTurnover = septemberData?.total_turnover || 0

    // Calculate if they're aligned 
    const difference = Math.abs(Number(weeklyTurnover) - Number(dashboardTurnover))
    const isAligned = difference < 1000 // Allow small differences due to rounding

    return new Response(JSON.stringify({ 
      success: true,
      alignment_test: {
        weekly_turnover: Number(weeklyTurnover),
        dashboard_september_turnover: Number(dashboardTurnover), 
        difference: difference,
        is_aligned: isAligned,
        expected_weekly: 3197474,
        status: isAligned ? "ALIGNED - Success!" : "NOT ALIGNED - Issue remains"
      },
      raw_data: {
        weekly_response: weeklyData?.[0],
        dashboard_september: septemberData
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Alignment test error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to test dashboard-weekly alignment"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})