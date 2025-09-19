import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Run diagnostic queries
    const diagnosticQuery = `
-- Quick verification of current weekly function logic
-- Test Week 36 with different scenarios to identify filtering

-- Step 1: Get Week 36 boundaries
SELECT 'WEEK 36 BOUNDARIES' as test,
       start_date::text, 
       end_date::text,
       'Sept 1-7, 2025' as expected
FROM weeks 
WHERE year = 2025 AND week_number = 36

UNION ALL

-- Step 2: Test current weekly function  
SELECT 'CURRENT WEEKLY FUNCTION' as test,
       current_week_turnover::text,
       current_week_start::text,
       current_week_end::text
FROM get_weekly_turnover_data(2025, 36, null, true)

UNION ALL

-- Step 3: Manual calculation - ALL transactions (what dashboard does)
SELECT 'MANUAL - ALL TRANSACTIONS' as test,
       SUM(amount)::text as total_amount,
       COUNT(*)::text as transaction_count,
       'Dashboard logic' as description
FROM salesdata s
JOIN weeks w ON w.year = 2025 AND w.week_number = 36
WHERE s.posting_date::date >= w.start_date
  AND s.posting_date::date <= w.end_date

UNION ALL

-- Step 4: Manual calculation - Excluding delivery fees (suspected weekly logic)
SELECT 'MANUAL - NO DELIVERY FEES' as test,
       SUM(amount)::text as total_amount,
       COUNT(*)::text as transaction_count,
       'Suspected weekly logic' as description
FROM salesdata s
JOIN weeks w ON w.year = 2025 AND w.week_number = 36  
WHERE s.posting_date::date >= w.start_date
  AND s.posting_date::date <= w.end_date
  AND NOT (s.item_code IS NULL AND s.posting_group = 'SRV')

UNION ALL

-- Step 5: Show just the delivery fees for Week 36
SELECT 'DELIVERY FEES ONLY' as test,
       COALESCE(SUM(amount), 0)::text as total_amount,
       COUNT(*)::text as transaction_count,
       'Should be ~5081.86' as description
FROM salesdata s
JOIN weeks w ON w.year = 2025 AND w.week_number = 36
WHERE s.posting_date::date >= w.start_date
  AND s.posting_date::date <= w.end_date
  AND s.item_code IS NULL 
  AND s.posting_group = 'SRV'

ORDER BY test;`

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: diagnosticQuery
    })

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results: data,
      analysis: "Diagnostic complete - check delivery fee amounts"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to run weekly function diagnostic"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})