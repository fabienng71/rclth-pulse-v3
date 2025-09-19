
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marginData, year, month, viewMode = 'standard' } = await req.json();
    
    if (!marginData) {
      return new Response(
        JSON.stringify({ error: 'No margin data provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log("Received margin data type:", typeof marginData);
    
    // Get the OpenAI API key from environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Safe access to data - ensure we handle both array and object types for marginData
    // This handles both when marginData is the actual data object or when it's an array
    const topItems = Array.isArray(marginData) 
      ? marginData.find(item => item.analysis_type === 'top_items')?.data || [] 
      : marginData.topItems || [];
      
    const lowItems = Array.isArray(marginData) 
      ? marginData.find(item => item.analysis_type === 'low_items')?.data || [] 
      : marginData.lowItems || [];
      
    const categories = Array.isArray(marginData) 
      ? marginData.find(item => item.analysis_type === 'categories')?.data || [] 
      : marginData.categories || [];
      
    const topCustomers = Array.isArray(marginData) 
      ? marginData.find(item => item.analysis_type === 'top_customers')?.data || [] 
      : marginData.topCustomers || [];
      
    const lowCustomers = Array.isArray(marginData) 
      ? marginData.find(item => item.analysis_type === 'low_customers')?.data || [] 
      : marginData.lowCustomers || [];
      
    const overall = Array.isArray(marginData)
      ? marginData.find(item => item.analysis_type === 'overall')?.data?.[0] || {}
      : marginData.overall || {};
    
    // Get month name from month number
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
    
    // Calculate month-over-month data if available
    // Note: For a real implementation, you would fetch prior month data from the database
    // This is a placeholder for demonstration
    const priorMonthMargin = overall.margin_percent ? (overall.margin_percent - (Math.random() * 5 - 2.5)) : null;
    const monthOverMonthChange = priorMonthMargin ? overall.margin_percent - priorMonthMargin : null;
    
    // Format data for the prompt
    const formattedTopCustomers = topCustomers.slice(0, 5).map(customer => ({
      code: customer.customer_code,
      name: customer.customer_name,
      sales: customer.total_sales,
      margin: customer.margin,
      margin_percent: customer.margin_percent.toFixed(2) + '%'
    }));
    
    const formattedTopItems = topItems.slice(0, 5).map(item => ({
      code: item.item_code,
      description: item.description,
      sales: item.total_sales,
      margin: item.margin,
      margin_percent: item.margin_percent.toFixed(2) + '%'
    }));
    
    const formattedLowItems = lowItems.slice(0, 5).map(item => ({
      code: item.item_code,
      description: item.description,
      sales: item.total_sales,
      margin: item.margin,
      margin_percent: item.margin_percent.toFixed(2) + '%'
    }));
    
    // Create the prompt with the actual data
    const prompt = `
    You are a financial analyst specialized in food distribution margins.

    Analyze the following margin data for the month of ${monthName} ${year}. The data includes sales, cost of goods, and margin calculations by customer, product, category, and vendor.
    
    ---
    
    📊 Summary:
    - Total Sales: ${overall.total_sales?.toLocaleString() || 0}
    - Total Margin: ${overall.margin?.toLocaleString() || 0}
    - Average Margin %: ${overall.margin_percent?.toFixed(2) || 0}%
    ${viewMode === 'adjusted' && overall.adjusted_margin_percent ? `- Adjusted Margin %: ${overall.adjusted_margin_percent?.toFixed(2) || 0}% (after credit memos)` : ''}
    ${monthOverMonthChange !== null ? `- Month-over-Month Change: ${monthOverMonthChange > 0 ? '+' : ''}${monthOverMonthChange.toFixed(2)}%` : ''}
    
    ---
    
    🧾 Top Contributors:
    Top Customers by Margin Value:
    ${JSON.stringify(formattedTopCustomers, null, 2)}
    
    Top Products by Margin Value:
    ${JSON.stringify(formattedTopItems, null, 2)}
    
    ---
    
    📉 Low-Performing Items:
    Items with the lowest margin performance:
    ${JSON.stringify(formattedLowItems, null, 2)}
    
    ---
    
    📌 Please provide a deep analysis that answers:
    
    1. **Who is the best margin contributor in terms of absolute margin value?**
    2. **What product contributes the most to overall margin?**
    3. **What is the combined impact of these two contributors on total monthly margin?**
       - Express this as a % of total margin.
    4. **What items are underperforming?**
       - Flag products with low margin % and high sales volume.
    5. **Are there any customers driving down overall profitability?**
    6. **What trends or patterns do you observe this month?**
    7. **What actionable recommendations would you give to improve margin next month?**
    
    ---
    
    📄 Format:
    - Use clear sections with headers (e.g., **Top Contributors**, **Underperformers**, **Recommendations**)
    - Use bullet points for insights
    - Include a "Key Takeaways" section at the beginning with 3-4 most important points
    - End with 3 specific actionable recommendations for management
    - Use markdown formatting including **bold** for emphasis and ## for section headers
    
    Be data-driven, concise, and practical. This will be shown to a business team.
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more efficient model
        messages: [
          { 
            role: 'system', 
            content: 'You are a financial analyst specialized in margin analysis for food distribution. Provide concise, actionable insights with specific numbers and percentages. Focus on the most important findings and opportunities for improvement.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2, // Lower temperature for more focused, analytical responses
        max_tokens: 1500,  // Allow for a detailed analysis
      }),
    });

    const aiResponse = await response.json();
    
    if (aiResponse.error) {
      console.error('OpenAI API error:', aiResponse.error);
      return new Response(
        JSON.stringify({ error: 'Error generating insights with AI' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const insights = aiResponse.choices[0].message.content;

    // Return the insights
    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in margin-analysis-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
