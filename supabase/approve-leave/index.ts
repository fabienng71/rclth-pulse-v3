import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leave_id, user_id } = await req.json();

    // Get leave details
    const { data: leave, error: leaveError } = await supabase
      .from('leaves')
      .select('leave_type, length')
      .eq('id', leave_id)
      .single();

    if (leaveError) throw leaveError;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('al_credit, bl_credit, sl_credit')
      .eq('id', user_id)
      .single();

    if (profileError) throw profileError;

    // Calculate new credit
    let creditField = '';
    let newCreditValue = 0;

    if (leave.leave_type === 'AL') {
      creditField = 'al_credit';
      newCreditValue = (profile.al_credit || 0) - leave.length;
    } else if (leave.leave_type === 'BL') {
      creditField = 'bl_credit';
      newCreditValue = (profile.bl_credit || 0) - leave.length;
    } else if (leave.leave_type === 'SL') {
      creditField = 'sl_credit';
      newCreditValue = (profile.sl_credit || 0) - leave.length;
    }

    // Update profile with new credit value
    if (creditField) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [creditField]: newCreditValue })
        .eq('id', user_id);

      if (updateError) throw updateError;
    }

    // Mark leave as approved
    const { error: approveError } = await supabase
      .from('leaves')
      .update({ approved: true })
      .eq('id', leave_id);

    if (approveError) throw approveError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});