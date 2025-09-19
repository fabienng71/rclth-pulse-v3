
import { corsHeaders } from "../_shared/cors.ts";
import { supabase } from "../_shared/supabase-client.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get current date and set cutoff date (7 days ago)
    const today = new Date();
    const followupCutoffDate = new Date();
    followupCutoffDate.setDate(today.getDate() - 7);
    
    console.log(`Looking for sample requests with follow-up date before ${followupCutoffDate.toISOString()}`);

    // Find sample requests that need follow-up
    const { data: sampleRequests, error: queryError } = await supabase
      .from('sample_requests')
      .select(`
        id, 
        customer_name,
        customer_code,
        salesperson_code,
        follow_up_date,
        created_at
      `)
      .lt('follow_up_date', followupCutoffDate.toISOString())
      .is('archived', null)  // Only non-archived requests
      .order('follow_up_date');
    
    if (queryError) {
      throw new Error(`Error fetching sample requests: ${queryError.message}`);
    }
    
    console.log(`Found ${sampleRequests?.length || 0} sample requests that need follow-up`);
    
    // Process each request that needs follow-up
    const processedRequests = await Promise.all((sampleRequests || []).map(async (request) => {
      // Find the salesperson's email to send notifications
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('spp_code', request.salesperson_code)
        .single();
      
      // Get sample request items
      const { data: items } = await supabase
        .from('sample_request_items')
        .select('item_code, description, quantity')
        .eq('request_id', request.id);
      
      return {
        request,
        salesperson: profiles,
        items: items || [],
        needsFollowUp: true
      };
    }));

    // In a real implementation, we would send emails here
    // For now just log what would be sent
    for (const { request, salesperson, items } of processedRequests) {
      console.log(`Would send follow-up notification for sample request ${request.id}`);
      console.log(`Customer: ${request.customer_name} (${request.customer_code})`);
      console.log(`Salesperson: ${salesperson?.full_name || 'Unknown'}`);
      console.log(`Email would be sent to: ${salesperson?.email || 'Unknown'}`);
      console.log(`Sample items: ${items.length} items`);
      console.log('--------------------------------');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedRequests.length} sample requests that need follow-up`,
        data: processedRequests
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing sample follow-ups:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
