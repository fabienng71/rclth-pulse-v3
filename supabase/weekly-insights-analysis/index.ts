
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Weekly Insights Analysis Function Started ===');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const requestBody = await req.json();
    const { year, week, salespersonCode, isAdmin } = requestBody;
    
    console.log('Request parameters:', { year, week, salespersonCode, isAdmin });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test database connection first
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('weeks')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    console.log('Database connection successful');

    // Try to use the enhanced fine dining function first
    let enhancedData = null;
    let analysisType = 'standard';
    
    console.log('Attempting enhanced fine dining analysis...');
    try {
      const { data: enhancedResult, error: enhancedError } = await supabase.rpc(
        'get_fine_dining_weekly_insights_data',
        {
          p_year: year,
          p_week: week,
          p_salesperson_code: salespersonCode,
          p_is_admin: isAdmin
        }
      );

      console.log('Enhanced function result:', { 
        hasData: !!enhancedResult, 
        error: enhancedError?.message || 'none' 
      });

      if (!enhancedError && enhancedResult) {
        enhancedData = enhancedResult;
        analysisType = 'enhanced_fine_dining';
        console.log('✓ Enhanced fine dining analysis successful');
        console.log('Enhanced data structure:', Object.keys(enhancedResult || {}));
      } else {
        console.log('Enhanced analysis failed, error:', enhancedError);
      }
    } catch (enhancedErr) {
      console.log('Enhanced analysis exception:', enhancedErr);
    }

    // Fallback to original function if enhanced fails
    if (!enhancedData) {
      console.log('Falling back to standard analysis...');
      const { data: weeklyData, error } = await supabase.rpc('get_weekly_insights_data', {
        p_year: year,
        p_week: week,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin
      });

      if (error) {
        console.error('Standard analysis error:', error);
        throw new Error(`Failed to fetch weekly data: ${error.message}`);
      }

      console.log('✓ Standard analysis successful, weeks fetched:', weeklyData?.length || 0);

      // Prepare the data for OpenAI analysis using the original format
      const currentWeekData = weeklyData.find((w: any) => w.week_number === week);
      const previousWeeksData = weeklyData.filter((w: any) => w.week_number < week);

      if (!currentWeekData) {
        throw new Error('No data found for the selected week');
      }

      enhancedData = {
        currentWeekData,
        previousWeeksData,
        analysisType: 'standard'
      };
    }

    // Prepare the analysis prompt based on data type
    let analysisPrompt = '';
    
    if (analysisType === 'enhanced_fine_dining') {
      console.log('Preparing enhanced restaurant intelligence prompt...');
      analysisPrompt = `You are a seasoned sales analyst specializing in fine dining and restaurant supply chain analysis. Below is comprehensive restaurant intelligence data for Week ${week} of ${year}. Analyze it thoroughly and present actionable insights for restaurant supply business.

Enhanced Restaurant Intelligence Data:
${JSON.stringify(enhancedData, null, 2)}

Please provide a comprehensive fine dining restaurant supply analysis including:

## 1. Weekly Performance Overview
• Total sales, profit margins, and transaction volumes
• Week-over-week performance trends and patterns
• Key performance indicators for restaurant supply business

## 2. Restaurant Tier Analysis & Customer Intelligence
• Performance breakdown by restaurant tier (high-end diverse, established, growing, etc.)
• Customer behavior changes and significant purchasing pattern shifts
• Restaurant diversification and menu development insights

## 3. Product & Inventory Intelligence
• Stock alert recommendations (low stock, out of stock, overstock items)
• Growth opportunity products with increasing demand
• Inventory optimization recommendations for restaurant suppliers

## 4. Customer Behavior Insights
• Significant purchasing pattern changes (20%+ variations)
• Seasonal menu pattern detection and implications
• Customer relationship development opportunities

## 5. Strategic Restaurant Supply Recommendations
• Immediate action items for inventory management
• Customer relationship enhancement strategies
• Market expansion opportunities based on restaurant tier analysis
• Product portfolio optimization for fine dining market

## 6. Risk Assessment & Opportunities
• Supply chain risks and mitigation strategies
• Market trends affecting fine dining establishments
• Cross-selling and upselling opportunities by restaurant tier

Format your response with clear headings, bullet points, and include specific numbers, percentages, and actionable recommendations. Focus on insights that drive business decisions in the restaurant supply industry.`;
    } else {
      console.log('Preparing standard analysis prompt...');
      const currentWeekData = enhancedData.currentWeekData;
      const previousWeeksData = enhancedData.previousWeeksData;
      
      analysisPrompt = `You are a seasoned sales analyst. Below is aggregated sales data for one week and previous weeks for comparison. Analyze it thoroughly and present your findings clearly.

Current Week Data (Week ${week}):
${JSON.stringify(currentWeekData.transaction_data, null, 2)}

Previous Weeks Comparison Data:
${JSON.stringify(previousWeeksData.map(w => ({ 
  week: w.week_number, 
  summary: w.transaction_data.week_summary,
  top_customers_count: w.transaction_data.top_customers?.length || 0,
  top_items_count: w.transaction_data.top_items?.length || 0,
  new_customers_count: w.transaction_data.new_customers?.length || 0
})), null, 2)}

Please provide a comprehensive weekly sales analysis including:

## 1. Weekly Performance Summary
• Total sales, transactions, customers, and items sold
• Average order value and overall margin performance
• Week-over-week comparison with previous week

## 2. Top Performers Analysis
• Top 5 customers by sales volume and their contribution
• Top 5 products by sales and margin performance
• Customer segment performance breakdown

## 3. Growth & Trends
• Sales growth percentage vs previous week
• New customer acquisition and their impact
• Product performance trends (growing vs declining items)

## 4. Customer Insights
• Customer segment analysis (different customer types)
• New vs returning customer metrics
• Customer concentration risk (dependency on top customers)

## 5. Product & Margin Analysis
• Best performing products by margin percentage
• Products with concerning margin trends
• Volume vs margin optimization opportunities

## 6. Strategic Recommendations
• Action items for the following week
• Opportunities for cross-selling or upselling
• Areas requiring attention or improvement
• Customer retention strategies

Format your response with clear headings, bullet points, and include specific numbers and percentages. Focus on actionable insights that can drive business decisions.`;
    }

    console.log('Calling OpenAI API...');
    // Call OpenAI API with the prepared data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: analysisType === 'enhanced_fine_dining' 
              ? 'You are a seasoned sales analyst with expertise in fine dining restaurant supply chain analysis and business intelligence. Provide detailed, actionable insights based on restaurant intelligence data. Focus on trends, opportunities, and specific recommendations for restaurant suppliers.' 
              : 'You are a seasoned sales analyst with expertise in retail analytics and business intelligence. Provide detailed, actionable insights based on aggregated sales data. Focus on trends, opportunities, and specific recommendations.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    console.log('✓ AI analysis completed successfully');
    console.log('Analysis type:', analysisType);
    console.log('Analysis length:', analysis?.length || 0, 'characters');

    const result = { 
      analysis,
      analysisType,
      dataStructure: analysisType === 'enhanced_fine_dining' ? 'restaurant_intelligence' : 'aggregated',
      weekData: analysisType === 'enhanced_fine_dining' ? enhancedData : enhancedData.currentWeekData,
      previousWeeksCount: analysisType === 'enhanced_fine_dining' ? 'multiple_periods' : enhancedData.previousWeeksData.length,
      timestamp: new Date().toISOString()
    };

    console.log('=== Function completed successfully ===');

    return new Response(
      JSON.stringify(result), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('=== Function error ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        details: 'Check function logs for more information'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
