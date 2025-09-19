import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the current function definition from pg_proc
    const functionCheckQuery = `
      SELECT 
        proname as function_name,
        prosrc as source_code,
        obj_description(oid, 'pg_proc') as comment
      FROM pg_proc 
      WHERE proname = 'get_weekly_turnover_data'
      ORDER BY oid DESC 
      LIMIT 1;
    `

    const { data: functionData, error: functionError } = await supabase
      .from('dummy') // This won't work, need to use raw SQL
      .select('*')

    // Alternative: Test the function behavior directly
    const testQueries = [
      {
        name: 'Week 35 Test',
        query: `SELECT current_week_turnover FROM get_weekly_turnover_data(2025, 35, null, true)`,
        expected: 3093134
      },
      {
        name: 'Week 36 Test', 
        query: `SELECT current_week_turnover FROM get_weekly_turnover_data(2025, 36, null, true)`,
        expected: 3197474
      },
      {
        name: 'Week 36 Manual ALL Transactions',
        query: `
          WITH week_boundaries AS (
            SELECT start_date, end_date FROM weeks WHERE year = 2025 AND week_number = 36
          )
          SELECT SUM(amount) as total
          FROM salesdata s, week_boundaries w
          WHERE s.posting_date::date >= w.start_date
            AND s.posting_date::date <= w.end_date
        `,
        expected: 3197474
      },
      {
        name: 'Week 36 Manual EXCLUDE Delivery Fees',
        query: `
          WITH week_boundaries AS (
            SELECT start_date, end_date FROM weeks WHERE year = 2025 AND week_number = 36
          )
          SELECT SUM(amount) as total
          FROM salesdata s, week_boundaries w
          WHERE s.posting_date::date >= w.start_date
            AND s.posting_date::date <= w.end_date
            AND NOT (s.item_code IS NULL AND s.posting_group = 'SRV')
        `,
        expected: 'unknown'
      },
      {
        name: 'Week 36 Delivery Fees Only',
        query: `
          WITH week_boundaries AS (
            SELECT start_date, end_date FROM weeks WHERE year = 2025 AND week_number = 36
          )
          SELECT COALESCE(SUM(amount), 0) as total
          FROM salesdata s, week_boundaries w
          WHERE s.posting_date::date >= w.start_date
            AND s.posting_date::date <= w.end_date
            AND s.item_code IS NULL 
            AND s.posting_group = 'SRV'
        `,
        expected: 'delivery_fees'
      }
    ]

    const results = []
    
    for (const test of testQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: test.query
        })
        
        if (error) {
          results.push({
            test: test.name,
            error: error.message,
            expected: test.expected
          })
        } else {
          const value = data?.[0]?.current_week_turnover || data?.[0]?.total || 0
          results.push({
            test: test.name,
            actual: Number(value),
            expected: test.expected,
            matches_expected: test.expected !== 'unknown' && test.expected !== 'delivery_fees' 
              ? Math.abs(Number(value) - test.expected) < 1
              : false
          })
        }
      } catch (err) {
        results.push({
          test: test.name,
          error: err.message,
          expected: test.expected
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        week_35_matches: results.find(r => r.test === 'Week 35 Test')?.matches_expected || false,
        week_36_matches: results.find(r => r.test === 'Week 36 Test')?.matches_expected || false,
        function_includes_delivery_fees: 'Check delivery fees test results',
        recommendations: 'Compare manual calculations with function results'
      },
      test_results: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function check error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to check weekly function version"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})