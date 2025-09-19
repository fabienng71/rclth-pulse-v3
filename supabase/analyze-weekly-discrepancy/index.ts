import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const diagnosticQuery = `
    -- Comprehensive diagnostic for Week 35 and 36 discrepancies
    -- Expected: Week 35 = 3,093,134, Week 36 = 3,197,474  
    -- Actual: Week 35 = 3,228,948.68, Week 36 = 3,231,754.48

    -- Test 1: Current function results
    WITH function_results AS (
        SELECT 
            'Week 35 Function' as test,
            current_week_turnover as value,
            3093134 as expected,
            current_week_turnover - 3093134 as difference
        FROM get_weekly_turnover_data(2025, 35, null, true)
        UNION ALL
        SELECT 
            'Week 36 Function' as test,
            current_week_turnover as value,
            3197474 as expected, 
            current_week_turnover - 3197474 as difference
        FROM get_weekly_turnover_data(2025, 36, null, true)
    ),

    -- Test 2: Raw sales totals (no credit memo deduction)
    week35_raw AS (
        SELECT 
            'Week 35 Raw Sales' as test,
            SUM(amount) as value,
            0 as expected,
            0 as difference
        FROM salesdata s
        JOIN weeks w ON w.year = 2025 AND w.week_number = 35
        WHERE s.posting_date::date >= w.start_date
          AND s.posting_date::date <= w.end_date
    ),
    week36_raw AS (
        SELECT 
            'Week 36 Raw Sales' as test,
            SUM(amount) as value,
            0 as expected,
            0 as difference
        FROM salesdata s
        JOIN weeks w ON w.year = 2025 AND w.week_number = 36
        WHERE s.posting_date::date >= w.start_date
          AND s.posting_date::date <= w.end_date
    ),

    -- Test 3: Credit memos only
    week35_credit AS (
        SELECT 
            'Week 35 Credit Memos' as test,
            SUM(ABS(amount)) as value,
            0 as expected,
            0 as difference
        FROM salesdata s
        JOIN weeks w ON w.year = 2025 AND w.week_number = 35
        WHERE s.posting_date::date >= w.start_date
          AND s.posting_date::date <= w.end_date
          AND s.amount < 0
    ),
    week36_credit AS (
        SELECT 
            'Week 36 Credit Memos' as test,
            SUM(ABS(amount)) as value,
            0 as expected,
            0 as difference
        FROM salesdata s
        JOIN weeks w ON w.year = 2025 AND w.week_number = 36
        WHERE s.posting_date::date >= w.start_date
          AND s.posting_date::date <= w.end_date
          AND s.amount < 0
    ),

    -- Test 4: Manual calculation (sales - credit memos)
    week35_manual AS (
        SELECT 
            'Week 35 Manual (Sales - Credit)' as test,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) - SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as value,
            3093134 as expected,
            (SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) - SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END)) - 3093134 as difference
        FROM salesdata s
        JOIN weeks w ON w.year = 2025 AND w.week_number = 35
        WHERE s.posting_date::date >= w.start_date
          AND s.posting_date::date <= w.end_date
    ),
    week36_manual AS (
        SELECT 
            'Week 36 Manual (Sales - Credit)' as test,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) - SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as value,
            3197474 as expected,
            (SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) - SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END)) - 3197474 as difference
        FROM salesdata s
        JOIN weeks w ON w.year = 2025 AND w.week_number = 36
        WHERE s.posting_date::date >= w.start_date
          AND s.posting_date::date <= w.end_date
    ),

    -- Test 5: Week boundaries check
    boundaries AS (
        SELECT 
            'Week 35 Boundaries' as test,
            EXTRACT(EPOCH FROM (end_date - start_date)) / 86400 + 1 as value,
            7 as expected,
            EXTRACT(EPOCH FROM (end_date - start_date)) / 86400 + 1 - 7 as difference
        FROM weeks WHERE year = 2025 AND week_number = 35
        UNION ALL
        SELECT 
            'Week 36 Boundaries' as test,
            EXTRACT(EPOCH FROM (end_date - start_date)) / 86400 + 1 as value,
            7 as expected,
            EXTRACT(EPOCH FROM (end_date - start_date)) / 86400 + 1 - 7 as difference
        FROM weeks WHERE year = 2025 AND week_number = 36
    )

    -- Combine all results
    SELECT test, value::numeric(12,2), expected::numeric(12,2), difference::numeric(12,2)
    FROM (
        SELECT * FROM function_results
        UNION ALL SELECT * FROM week35_raw
        UNION ALL SELECT * FROM week36_raw
        UNION ALL SELECT * FROM week35_credit
        UNION ALL SELECT * FROM week36_credit
        UNION ALL SELECT * FROM week35_manual
        UNION ALL SELECT * FROM week36_manual
        UNION ALL SELECT * FROM boundaries
    ) combined
    ORDER BY 
        CASE 
            WHEN test LIKE '%Week 35%' THEN 1 
            WHEN test LIKE '%Week 36%' THEN 2 
            ELSE 3 
        END,
        test;
    `

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: diagnosticQuery
    })

    if (error) {
      throw new Error(`SQL error: ${error.message}`)
    }

    const results = data || []
    
    // Analyze patterns
    const week35Function = results.find(r => r.test === 'Week 35 Function')
    const week36Function = results.find(r => r.test === 'Week 36 Function') 
    const week35Manual = results.find(r => r.test === 'Week 35 Manual (Sales - Credit)')
    const week36Manual = results.find(r => r.test === 'Week 36 Manual (Sales - Credit)')

    const analysis = {
      function_vs_manual_week35: week35Function && week35Manual ? 
        (Number(week35Function.value) - Number(week35Manual.value)).toFixed(2) : 'unknown',
      function_vs_manual_week36: week36Function && week36Manual ? 
        (Number(week36Function.value) - Number(week36Manual.value)).toFixed(2) : 'unknown',
      conclusion: 'If function matches manual calculation, the issue is elsewhere'
    }

    return new Response(JSON.stringify({
      success: true,
      diagnostic_results: results,
      analysis: analysis,
      summary: {
        issue: 'Function returns higher values than user expectations',
        week_35_difference: week35Function ? `+${Number(week35Function.difference).toFixed(2)}` : 'unknown',
        week_36_difference: week36Function ? `+${Number(week36Function.difference).toFixed(2)}` : 'unknown',
        next_step: 'Compare manual calculation breakdown with user methodology'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Diagnostic error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to analyze weekly discrepancy"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})