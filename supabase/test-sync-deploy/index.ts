import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== TEST FUNCTION CALLED ===')
    
    // Test service role connection
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    
    console.log('=== SERVICE CLIENT CREATED ===')
    
    // Test database write
    const testResult = await serviceClient
      .from('sync_log')
      .insert({
        sync_type: 'test_deployment',
        status: 'success',
        records_processed: 1,
        records_updated: 0,
        records_inserted: 0,
        errors: null,
        sync_duration_ms: 100,
        synced_by: null
      })
    
    console.log('=== DATABASE TEST RESULT ===', testResult)
    
    if (testResult.error) {
      console.error('=== DATABASE TEST ERROR ===', testResult.error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: testResult.error.message,
          message: 'Database write failed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('=== TEST FUNCTION SUCCESS ===')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test function deployed and database write successful',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('=== TEST FUNCTION ERROR ===', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Test function failed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})