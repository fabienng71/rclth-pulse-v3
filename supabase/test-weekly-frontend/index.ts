import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test the exact same call that frontend makes
    const { data, error } = await supabase.rpc('get_weekly_turnover_data', {
      p_year: 2025,
      p_week: 36,
      p_salesperson_code: null,
      p_is_admin: true
    })

    if (error) {
      throw new Error(`RPC error: ${error.message}`)
    }

    // Also test Week 35
    const { data: week35Data, error: week35Error } = await supabase.rpc('get_weekly_turnover_data', {
      p_year: 2025,
      p_week: 35,
      p_salesperson_code: null, 
      p_is_admin: true
    })

    if (week35Error) {
      throw new Error(`Week 35 RPC error: ${week35Error.message}`)
    }

    const week36Result = data?.[0]
    const week35Result = week35Data?.[0]

    return new Response(JSON.stringify({
      success: true,
      function_is_updated: true,
      week35_result: {
        current_week_turnover: Number(week35Result?.current_week_turnover || 0),
        expected: 3093134,
        includes_all_services: Number(week35Result?.current_week_turnover || 0) > 3200000,
        difference_from_expected: Number(week35Result?.current_week_turnover || 0) - 3093134
      },
      week36_result: {
        current_week_turnover: Number(week36Result?.current_week_turnover || 0),
        expected: 3197474,
        includes_all_services: Number(week36Result?.current_week_turnover || 0) > 3200000,
        difference_from_expected: Number(week36Result?.current_week_turnover || 0) - 3197474
      },
      frontend_cache_instructions: {
        clear_browser_cache: "Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)",
        check_network_tab: "Verify API calls are being made",
        react_query_devtools: "Check if queries are stale"
      },
      raw_data: {
        week35: week35Result,
        week36: week36Result
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Test error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to test weekly function"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})