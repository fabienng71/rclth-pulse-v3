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
    
    console.log('Deploying service toggle function...');
    
    // SQL to update the function
    const sql = `
-- Drop existing function versions
DROP FUNCTION IF EXISTS public.get_weekly_turnover_data(integer, integer, text, boolean);
DROP FUNCTION IF EXISTS public.get_weekly_turnover_data(integer, integer, text, boolean, boolean);
DROP FUNCTION IF EXISTS public.get_weekly_turnover_data(integer, integer, text, boolean, boolean, boolean);

-- Create new function with service parameter
CREATE OR REPLACE FUNCTION public.get_weekly_turnover_data(
    p_year integer,
    p_week integer,
    p_salesperson_code text DEFAULT NULL,
    p_is_admin boolean DEFAULT false,
    p_include_credit_memo boolean DEFAULT true,
    p_include_services boolean DEFAULT false
)
RETURNS TABLE(
    current_week_turnover numeric,
    previous_year_week_turnover numeric,
    current_week_start date,
    current_week_end date,
    previous_year_week_start date,
    previous_year_week_end date
)
LANGUAGE sql
STABLE
AS $$
WITH week_boundaries AS (
    SELECT 
        cw.start_date AS current_start,
        cw.end_date AS current_end,
        pw.start_date AS previous_start,
        pw.end_date AS previous_end
    FROM public.weeks cw
    LEFT JOIN public.weeks pw ON pw.year = (p_year - 1) AND pw.week_number = p_week
    WHERE cw.year = p_year AND cw.week_number = p_week
),
current_week_sales AS (
    SELECT COALESCE(SUM(amount), 0) AS turnover
    FROM salesdata s, week_boundaries w
    WHERE s.posting_date::date >= w.current_start
      AND s.posting_date::date <= w.current_end
      AND (p_include_services = true OR s.posting_group <> 'SRV')
      AND (p_is_admin = true OR s.salesperson_code = p_salesperson_code)
      AND (p_salesperson_code IS NULL OR s.salesperson_code = p_salesperson_code)
),
current_week_credit_memos AS (
    SELECT COALESCE(SUM(amount), 0) AS credit_amount
    FROM credit_memos cm, week_boundaries w
    WHERE cm.posting_date::date >= w.current_start
      AND cm.posting_date::date <= w.current_end
      AND (p_is_admin = true OR cm.salesperson_code = p_salesperson_code)
      AND (p_salesperson_code IS NULL OR cm.salesperson_code = p_salesperson_code)
),
previous_week_sales AS (
    SELECT COALESCE(SUM(amount), 0) AS turnover
    FROM salesdata s, week_boundaries w
    WHERE s.posting_date::date >= w.previous_start
      AND s.posting_date::date <= w.previous_end
      AND (p_include_services = true OR s.posting_group <> 'SRV')
      AND (p_is_admin = true OR s.salesperson_code = p_salesperson_code)
      AND (p_salesperson_code IS NULL OR s.salesperson_code = p_salesperson_code)
),
previous_week_credit_memos AS (
    SELECT COALESCE(SUM(amount), 0) AS credit_amount
    FROM credit_memos cm, week_boundaries w
    WHERE cm.posting_date::date >= w.previous_start
      AND cm.posting_date::date <= w.previous_end
      AND (p_is_admin = true OR cm.salesperson_code = p_salesperson_code)
      AND (p_salesperson_code IS NULL OR cm.salesperson_code = p_salesperson_code)
)
SELECT 
    CASE 
        WHEN p_include_credit_memo THEN cws.turnover
        ELSE cws.turnover - cwcm.credit_amount
    END AS current_week_turnover,
    CASE 
        WHEN p_include_credit_memo THEN pws.turnover
        ELSE pws.turnover - pwcm.credit_amount
    END AS previous_year_week_turnover,
    wb.current_start AS current_week_start,
    wb.current_end AS current_week_end,
    wb.previous_start AS previous_year_week_start,
    wb.previous_end AS previous_year_week_end
FROM current_week_sales cws, previous_week_sales pws, week_boundaries wb,
     current_week_credit_memos cwcm, previous_week_credit_memos pwcm;
$$;

-- Set permissions
ALTER FUNCTION public.get_weekly_turnover_data(integer, integer, text, boolean, boolean, boolean) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_weekly_turnover_data(integer, integer, text, boolean, boolean, boolean) TO anon;
GRANT ALL ON FUNCTION public.get_weekly_turnover_data(integer, integer, text, boolean, boolean, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.get_weekly_turnover_data(integer, integer, text, boolean, boolean, boolean) TO service_role;
`;

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
    
    console.log('Service toggle function deployed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Service toggle function deployed successfully',
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