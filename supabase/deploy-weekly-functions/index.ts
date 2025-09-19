import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Deploying updated weekly functions with service parameter...');
    
    // SQL to update the functions
    const sql = `
-- Update get_weekly_progress_data function
DROP FUNCTION IF EXISTS public.get_weekly_progress_data(integer, integer, text, boolean, boolean);
DROP FUNCTION IF EXISTS public.get_weekly_progress_data(integer, integer, text, boolean, boolean, boolean);

CREATE OR REPLACE FUNCTION public.get_weekly_progress_data(
    p_year integer,
    p_week integer,
    p_salesperson_code text DEFAULT NULL,
    p_is_admin boolean DEFAULT false,
    p_include_credit_memo boolean DEFAULT true,
    p_include_services boolean DEFAULT false
)
RETURNS TABLE(
    week_number integer,
    current_year_turnover numeric,
    previous_year_turnover numeric,
    current_year_running_total numeric,
    previous_year_running_total numeric,
    variance_percent numeric
)
LANGUAGE sql
STABLE
AS $func$
WITH weekly_sales AS (
    SELECT 
        w.week_number,
        -- Current year sales for each week
        (SELECT COALESCE(SUM(s.amount), 0)
         FROM salesdata s
         WHERE s.posting_date::date >= w.start_date
           AND s.posting_date::date <= w.end_date
           AND (p_include_services = true OR s.posting_group <> 'SRV')
           AND (p_is_admin = true OR s.salesperson_code = p_salesperson_code)
           AND (p_salesperson_code IS NULL OR s.salesperson_code = p_salesperson_code)
        ) AS current_year_sales,
        
        -- Previous year sales for same week
        (SELECT COALESCE(SUM(s.amount), 0)
         FROM salesdata s
         INNER JOIN weeks pw ON pw.year = (p_year - 1) AND pw.week_number = w.week_number
         WHERE s.posting_date::date >= pw.start_date
           AND s.posting_date::date <= pw.end_date
           AND (p_include_services = true OR s.posting_group <> 'SRV')
           AND (p_is_admin = true OR s.salesperson_code = p_salesperson_code)
           AND (p_salesperson_code IS NULL OR s.salesperson_code = p_salesperson_code)
        ) AS previous_year_sales,
        
        -- Current year credit memos for each week
        (SELECT COALESCE(SUM(cm.amount), 0)
         FROM credit_memos cm
         WHERE cm.posting_date::date >= w.start_date
           AND cm.posting_date::date <= w.end_date
           AND (p_is_admin = true OR cm.salesperson_code = p_salesperson_code)
           AND (p_salesperson_code IS NULL OR cm.salesperson_code = p_salesperson_code)
        ) AS current_year_credits,
        
        -- Previous year credit memos for same week
        (SELECT COALESCE(SUM(cm.amount), 0)
         FROM credit_memos cm
         INNER JOIN weeks pw ON pw.year = (p_year - 1) AND pw.week_number = w.week_number
         WHERE cm.posting_date::date >= pw.start_date
           AND cm.posting_date::date <= pw.end_date
           AND (p_is_admin = true OR cm.salesperson_code = p_salesperson_code)
           AND (p_salesperson_code IS NULL OR cm.salesperson_code = p_salesperson_code)
        ) AS previous_year_credits
    FROM weeks w
    WHERE w.year = p_year
      AND w.week_number >= 14
      AND w.week_number <= p_week
    ORDER BY w.week_number
),
running_totals AS (
    SELECT 
        week_number,
        current_year_sales,
        previous_year_sales,
        current_year_credits,
        previous_year_credits,
        CASE 
            WHEN p_include_credit_memo THEN current_year_sales
            ELSE current_year_sales - current_year_credits
        END AS current_year_turnover,
        CASE 
            WHEN p_include_credit_memo THEN previous_year_sales
            ELSE previous_year_sales - previous_year_credits
        END AS previous_year_turnover,
        SUM(CASE 
            WHEN p_include_credit_memo THEN current_year_sales
            ELSE current_year_sales - current_year_credits
        END) OVER (ORDER BY week_number) AS current_year_running_total,
        SUM(CASE 
            WHEN p_include_credit_memo THEN previous_year_sales
            ELSE previous_year_sales - previous_year_credits
        END) OVER (ORDER BY week_number) AS previous_year_running_total
    FROM weekly_sales
)
SELECT 
    rt.week_number,
    rt.current_year_turnover,
    rt.previous_year_turnover,
    rt.current_year_running_total,
    rt.previous_year_running_total,
    CASE 
        WHEN rt.previous_year_turnover > 0 THEN
            ROUND(((rt.current_year_turnover - rt.previous_year_turnover) / rt.previous_year_turnover) * 100, 1)
        ELSE 
            CASE WHEN rt.current_year_turnover > 0 THEN 100.0 ELSE 0.0 END
    END AS variance_percent
FROM running_totals rt;
$func$;

-- Update get_weekly_top_customers function  
DROP FUNCTION IF EXISTS public.get_weekly_top_customers(integer, integer, text, boolean, boolean);
DROP FUNCTION IF EXISTS public.get_weekly_top_customers(integer, integer, text, boolean, boolean, boolean);

CREATE OR REPLACE FUNCTION public.get_weekly_top_customers(
    p_year integer,
    p_week integer,
    p_salesperson_code text DEFAULT NULL,
    p_is_admin boolean DEFAULT false,
    p_include_credit_memo boolean DEFAULT true,
    p_include_services boolean DEFAULT false
)
RETURNS TABLE(
    period_type text,
    customer_code text,
    search_name text,
    turnover numeric,
    rank_position integer
)
LANGUAGE sql
STABLE
AS $func$
WITH current_week_customers AS (
    SELECT 
        'current' AS period_type,
        s.customer_code,
        c.search_name,
        CASE 
            WHEN p_include_credit_memo THEN SUM(s.amount)
            ELSE SUM(s.amount) - COALESCE((
                SELECT SUM(cm.amount)
                FROM credit_memos cm
                INNER JOIN weeks w ON w.year = p_year AND w.week_number = p_week
                WHERE cm.customer_code = s.customer_code
                  AND cm.posting_date::date >= w.start_date
                  AND cm.posting_date::date <= w.end_date
                  AND (p_is_admin = true OR cm.salesperson_code = p_salesperson_code)
                  AND (p_salesperson_code IS NULL OR cm.salesperson_code = p_salesperson_code)
            ), 0)
        END AS turnover
    FROM salesdata s
    INNER JOIN customers c ON c.customer_code = s.customer_code
    INNER JOIN weeks w ON w.year = p_year AND w.week_number = p_week
    WHERE s.posting_date::date >= w.start_date
      AND s.posting_date::date <= w.end_date
      AND (p_include_services = true OR s.posting_group <> 'SRV')
      AND (p_is_admin = true OR s.salesperson_code = p_salesperson_code)
      AND (p_salesperson_code IS NULL OR s.salesperson_code = p_salesperson_code)
    GROUP BY s.customer_code, c.search_name
    HAVING SUM(s.amount) > 0
    ORDER BY turnover DESC
    LIMIT 5
),
previous_week_customers AS (
    SELECT 
        'previous' AS period_type,
        s.customer_code,
        c.search_name,
        CASE 
            WHEN p_include_credit_memo THEN SUM(s.amount)
            ELSE SUM(s.amount) - COALESCE((
                SELECT SUM(cm.amount)
                FROM credit_memos cm
                INNER JOIN weeks pw ON pw.year = (p_year - 1) AND pw.week_number = p_week
                WHERE cm.customer_code = s.customer_code
                  AND cm.posting_date::date >= pw.start_date
                  AND cm.posting_date::date <= pw.end_date
                  AND (p_is_admin = true OR cm.salesperson_code = p_salesperson_code)
                  AND (p_salesperson_code IS NULL OR cm.salesperson_code = p_salesperson_code)
            ), 0)
        END AS turnover
    FROM salesdata s
    INNER JOIN customers c ON c.customer_code = s.customer_code
    INNER JOIN weeks pw ON pw.year = (p_year - 1) AND pw.week_number = p_week
    WHERE s.posting_date::date >= pw.start_date
      AND s.posting_date::date <= pw.end_date
      AND (p_include_services = true OR s.posting_group <> 'SRV')
      AND (p_is_admin = true OR s.salesperson_code = p_salesperson_code)
      AND (p_salesperson_code IS NULL OR s.salesperson_code = p_salesperson_code)
    GROUP BY s.customer_code, c.search_name
    HAVING SUM(s.amount) > 0
    ORDER BY turnover DESC
    LIMIT 5
)
SELECT 
    period_type,
    customer_code,
    search_name,
    turnover,
    ROW_NUMBER() OVER (PARTITION BY period_type ORDER BY turnover DESC)::integer AS rank_position
FROM (
    SELECT * FROM current_week_customers
    UNION ALL
    SELECT * FROM previous_week_customers
) combined_data
ORDER BY period_type, rank_position;
$func$;

-- Update get_weekly_customer_list function  
DROP FUNCTION IF EXISTS public.get_weekly_customer_list(integer, integer, text, boolean, boolean);
DROP FUNCTION IF EXISTS public.get_weekly_customer_list(integer, integer, text, boolean, boolean, boolean);

CREATE OR REPLACE FUNCTION public.get_weekly_customer_list(
    p_year integer,
    p_week integer,
    p_salesperson_code text DEFAULT NULL,
    p_is_admin boolean DEFAULT false,
    p_include_credit_memo boolean DEFAULT true,
    p_include_services boolean DEFAULT false
)
RETURNS TABLE(
    customer_code text,
    customer_name text,
    search_name text,
    weekly_turnover numeric,
    weekly_margin_amount numeric,
    weekly_margin_percent numeric,
    transaction_count integer,
    salesperson_code text
)
LANGUAGE sql
STABLE
AS $func$
WITH weekly_customer_sales AS (
    SELECT 
        s.customer_code,
        c.customer_name,
        c.search_name,
        s.salesperson_code,
        SUM(s.amount) AS total_sales,
        SUM(s.cost_amount) AS total_cost,
        COUNT(*) AS transaction_count,
        -- Calculate credit memo amount if needed
        (SELECT COALESCE(SUM(cm.amount), 0)
         FROM credit_memos cm
         INNER JOIN weeks w ON w.year = p_year AND w.week_number = p_week
         WHERE cm.customer_code = s.customer_code
           AND cm.posting_date::date >= w.start_date
           AND cm.posting_date::date <= w.end_date
           AND (p_is_admin = true OR cm.salesperson_code = p_salesperson_code)
           AND (p_salesperson_code IS NULL OR cm.salesperson_code = p_salesperson_code)
        ) AS credit_memo_amount
    FROM salesdata s
    INNER JOIN customers c ON c.customer_code = s.customer_code
    INNER JOIN weeks w ON w.year = p_year AND w.week_number = p_week
    WHERE s.posting_date::date >= w.start_date
      AND s.posting_date::date <= w.end_date
      AND (p_include_services = true OR s.posting_group <> 'SRV')
      AND (p_is_admin = true OR s.salesperson_code = p_salesperson_code)
      AND (p_salesperson_code IS NULL OR s.salesperson_code = p_salesperson_code)
    GROUP BY s.customer_code, c.customer_name, c.search_name, s.salesperson_code
)
SELECT 
    wcs.customer_code,
    wcs.customer_name,
    wcs.search_name,
    CASE 
        WHEN p_include_credit_memo THEN wcs.total_sales
        ELSE wcs.total_sales - wcs.credit_memo_amount
    END AS weekly_turnover,
    CASE 
        WHEN p_include_credit_memo THEN (wcs.total_sales - wcs.total_cost)
        ELSE (wcs.total_sales - wcs.credit_memo_amount) - wcs.total_cost
    END AS weekly_margin_amount,
    CASE 
        WHEN wcs.total_sales > 0 THEN
            CASE 
                WHEN p_include_credit_memo THEN 
                    ROUND(((wcs.total_sales - wcs.total_cost) / wcs.total_sales) * 100, 1)
                ELSE 
                    ROUND((((wcs.total_sales - wcs.credit_memo_amount) - wcs.total_cost) / GREATEST(wcs.total_sales - wcs.credit_memo_amount, 0.01)) * 100, 1)
            END
        ELSE 0.0
    END AS weekly_margin_percent,
    wcs.transaction_count::integer,
    wcs.salesperson_code
FROM weekly_customer_sales wcs
WHERE wcs.total_sales > 0
ORDER BY weekly_turnover DESC;
$func$;

-- Set permissions for all functions
ALTER FUNCTION public.get_weekly_progress_data(integer, integer, text, boolean, boolean, boolean) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_weekly_progress_data(integer, integer, text, boolean, boolean, boolean) TO anon;
GRANT ALL ON FUNCTION public.get_weekly_progress_data(integer, integer, text, boolean, boolean, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.get_weekly_progress_data(integer, integer, text, boolean, boolean, boolean) TO service_role;

ALTER FUNCTION public.get_weekly_top_customers(integer, integer, text, boolean, boolean, boolean) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_weekly_top_customers(integer, integer, text, boolean, boolean, boolean) TO anon;
GRANT ALL ON FUNCTION public.get_weekly_top_customers(integer, integer, text, boolean, boolean, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.get_weekly_top_customers(integer, integer, text, boolean, boolean, boolean) TO service_role;

ALTER FUNCTION public.get_weekly_customer_list(integer, integer, text, boolean, boolean, boolean) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_weekly_customer_list(integer, integer, text, boolean, boolean, boolean) TO anon;
GRANT ALL ON FUNCTION public.get_weekly_customer_list(integer, integer, text, boolean, boolean, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.get_weekly_customer_list(integer, integer, text, boolean, boolean, boolean) TO service_role;
`;

    // Execute using direct query
    const { data, error } = await supabase.from('dual').select('*').limit(0); // Dummy query to test connection
    if (error) {
      console.log('Testing connection...', error);
    }
    
    // Split and execute statements individually
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Use raw query execution
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Statement ${i + 1} failed:`, errorText);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Statement ${i + 1} error:`, err);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Weekly functions updated with service parameter',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Deployment error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});