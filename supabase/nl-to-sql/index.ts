
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { prompt, user_id } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate user is authenticated
    if (!user_id) {
      console.error("No user_id provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user exists in profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .single();

    if (profileError || !userProfile) {
      console.error("User not found in profiles", user_id, profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing natural language query:", prompt);

    const systemPrompt = `You are a PostgreSQL expert. Convert natural language queries to valid PostgreSQL SELECT statements.

IMPORTANT RULES:
1. ONLY generate SELECT statements. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, or any other DML/DDL statements.
2. If asked for non-SELECT operations, respond with: "I cannot provide a query for [OPERATION TYPE] operations."
3. Use proper PostgreSQL syntax and functions.
4. Always use single quotes for string literals.
5. Use appropriate date/time functions for date comparisons.
6. Be precise with table and column names.

Available tables and key columns:
- salesdata: customer_code, customer_name, item_code, description, amount, quantity, posting_date, document_no, salesperson_code
- customers: customer_code, customer_name, search_name, customer_type_code, salesperson_code
- items: item_code, description, vendor_code, posting_group, unit_price
- activities: customer_code, customer_name, activity_type, activity_date, notes, status
- leads: customer_name, contact_name, email, phone, status, created_at
- contacts: customer_code, customer_name, first_name, last_name, email, telephone

Convert this natural language query to a PostgreSQL SELECT statement:`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedSQL = data.choices[0]?.message?.content?.trim();

    if (!generatedSQL) {
      throw new Error("Failed to generate SQL query");
    }

    console.log("Generated SQL query:", generatedSQL);

    // Additional safety check for non-SELECT queries
    if (!generatedSQL.toLowerCase().trim().startsWith("select")) {
      console.error("Non-SELECT query generated:", generatedSQL);
      return new Response(
        JSON.stringify({ error: "Only SELECT queries are allowed for security reasons" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sql: generatedSQL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in nl-to-sql function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
