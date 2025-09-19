
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const dbUrl = Deno.env.get("SUPABASE_DB_URL");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to convert BigInt values to strings for JSON serialization
function convertBigIntToString(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  if (obj !== null && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }
  return obj;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for admin operations
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Parse request
    const { sql, user_id } = await req.json();

    // Validate required fields
    if (!sql) {
      return new Response(
        JSON.stringify({ error: "Missing SQL query" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate user is authenticated (basic check)
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

    // Safety check - only allow SELECT statements
    if (!sql.toLowerCase().trim().startsWith("select")) {
      console.error("Non-SELECT query attempted:", sql);
      return new Response(
        JSON.stringify({ error: "Only SELECT queries are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute SQL query
    const pool = new Pool(dbUrl!, 3);
    const connection = await pool.connect();
    
    try {
      console.log("Executing SQL query:", sql);
      const result = await connection.queryObject(sql);
      console.log("Query executed successfully");
      
      // Enhanced debug logging
      console.log("Raw query result structure:", 
        JSON.stringify({
          hasColumns: !!result.columns,
          columnCount: result.columns?.length || 0,
          hasRows: !!result.rows,
          rowCount: result.rows?.length || 0,
          sampleRow: result.rows && result.rows.length > 0 ? "Row exists (will be converted)" : 'No rows'
        })
      );
      
      if (result.columns) {
        console.log("Column details:", JSON.stringify(result.columns));
      }
      
      // Extract column names from the result, filtering out any null values
      let columns: string[] = [];
      if (result.columns && result.columns.length > 0) {
        columns = result.columns
          .map(col => col.name)
          .filter(name => name !== null && name !== undefined);
        
        console.log("Extracted column names:", columns);
      }
      
      // If no valid columns were found, try to extract from the first row
      if (columns.length === 0 && result.rows && result.rows.length > 0) {
        columns = Object.keys(result.rows[0]);
        console.log("Fallback: extracted column names from first row:", columns);
      }
      
      // Final fallback - if we still have no columns but have rows
      if (columns.length === 0 && result.rows && result.rows.length > 0) {
        console.log("Warning: No column names could be extracted. Creating generic columns.");
        // Create generic column names based on the number of properties in the first row
        const firstRow = result.rows[0];
        columns = Object.keys(firstRow).map((_, i) => `Column_${i+1}`);
      }
      
      // Convert BigInt values to strings to avoid JSON serialization issues
      const convertedRows = result.rows ? convertBigIntToString(result.rows) : [];
      
      console.log(`Processed result: ${convertedRows.length} rows, ${columns.length} columns`);
      
      if (convertedRows.length === 0) {
        console.log("Query returned zero rows - verify query is correct");
      }
      
      return new Response(
        JSON.stringify({ 
          columns,
          results: convertedRows,
          rowCount: convertedRows.length
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } finally {
      connection.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Error in execute-SQL function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
