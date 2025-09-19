
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body
    const { salesData, customerCode, dateRange } = await req.json();
    
    // Log the analysis request
    console.log(`Analyzing data for customer ${customerCode} from ${dateRange.from} to ${dateRange.to}\n`);
    
    // Validate the input data
    if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No sales data provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Improved sampling logic to handle large datasets
    // Limit the number of samples to avoid token limits
    const maxSamples = 50; // Reduced from 200 to 50 to avoid token limits
    const sampleSize = Math.min(maxSamples, salesData.length);
    
    // Better sampling strategy: take some from the beginning, middle, and end for better representation
    let sampledData = [];
    if (salesData.length <= maxSamples) {
      sampledData = salesData;
    } else {
      // Take samples from beginning, middle and end for better representation
      const beginning = salesData.slice(0, Math.floor(maxSamples / 3));
      const middle = salesData.slice(
        Math.floor(salesData.length / 2 - maxSamples / 6),
        Math.floor(salesData.length / 2 + maxSamples / 6)
      );
      const end = salesData.slice(-Math.floor(maxSamples / 3));
      sampledData = [...beginning, ...middle, ...end];
    }
    
    // Create a summary of the data instead of sending the raw data
    const totalRecords = salesData.length;
    const uniqueItems = new Set(salesData.map(item => item.item_code)).size;
    const totalSalesAmount = salesData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalQuantity = salesData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Format the date range for the prompt
    const dateRangeText = `${dateRange.from} to ${dateRange.to}`;
    
    // Calculate additional metrics for the enhanced prompt
    const transactionCount = new Set(salesData.map(item => item.document_no)).size;
    const averageOrderValue = transactionCount > 0 ? 
      (totalSalesAmount / transactionCount).toFixed(2) : 0;

    // Try to fetch customer analytics data if available
    let customerSegments = {};
    let rfmScore = {};
    try {
      const { data: analyticsData } = await supabase
        .from('customer_analytics')
        .select('customer_segments, rfm_score')
        .eq('customer_code', customerCode)
        .single();
        
      if (analyticsData) {
        customerSegments = analyticsData.customer_segments || {};
        rfmScore = analyticsData.rfm_score || {};
      }
    } catch (error) {
      console.log('No customer analytics data found, continuing without it');
    }
    
    // Create the enhanced structured prompt
    const prompt = `You are a B2B sales analyst specialized in premium food ingredient distribution. 
Based on the following customer sales data and summary metrics, generate a concise and insightful business analysis. 
This analysis is intended for use by a sales manager to guide account strategy.

Customer: ${customerCode}  
Period: ${dateRange.from} to ${dateRange.to}  

Customer Segments: ${JSON.stringify(customerSegments)}  
RFM Score: ${JSON.stringify(rfmScore)}  

---

📊 **Sales Summary**:
- Total Transactions: ${transactionCount}
- Unique Items Purchased: ${uniqueItems}
- Total Sales Amount: ${totalSalesAmount.toFixed(2)}
- Total Quantity: ${totalQuantity.toFixed(2)}
- Average Order Value: ${averageOrderValue}

---

📦 **Sample Data (From ${sampleSize} out of ${totalRecords} records)**:
${JSON.stringify(sampledData.slice(0, 10), ['item_code', 'description', 'quantity', 'amount', 'posting_date'], 2)}

---

🧠 Please analyze and return clear, structured insights on:

1. **Overall Sales Trends**  
   - General performance vs historical patterns  
   - Any sharp increases, declines, or irregularities  

2. **Top-Selling Products and Categories**  
   - Highlight best performers by value and volume  
   - Identify any recent shifts in preference  

3. **Purchase Frequency & Order Value**  
   - Comment on consistency and size of orders  
   - Benchmark against their segment if relevant  

4. **Seasonal Patterns or Buying Cycles**  
   - Detect any periodicity or recurring behaviors  

5. **Cross-Selling / Upselling Opportunities**  
   - Suggest related items or premium alternatives  
   - Based on their top categories or gaps in purchase behavior  

6. **Growth Potential or Risks**  
   - Identify signs of churn, stagnation, or opportunity  
   - Consider segment and RFM score context  

---

📄 **Formatting Instructions**:
- Use clear section headings (e.g., **Sales Trends**, **Top Products**)
- Use bullet points for insights and suggestions
- Finish with a 1-paragraph summary including 2 recommended actions

Keep it professional, data-driven, and concise. Avoid repeating the summary data.`;
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more efficient model that can handle our needs
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst with expertise in sales data analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!openAIResponse.ok) {
      const openAIData = await openAIResponse.json();
      console.error('OpenAI API error:', openAIData);
      
      // Better error handling with more specific messages
      const errorMessage = openAIData?.error?.message || 'Unknown OpenAI API error';
      
      // Handle rate limit errors specifically
      if (errorMessage.includes('rate limit') || openAIData?.error?.code === 'rate_limit_exceeded') {
        return new Response(
          JSON.stringify({ 
            error: 'API rate limit exceeded. Please try again in a few minutes.',
            details: errorMessage
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate analysis', details: errorMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const openAIData = await openAIResponse.json();
    
    // Extract the analysis text
    const analysis = openAIData.choices?.[0]?.message?.content;
    
    if (!analysis) {
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error in analyze-sales function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
