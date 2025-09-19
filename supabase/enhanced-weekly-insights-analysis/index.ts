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
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface EnhancedAnalysisRequest {
  year: number;
  week: number;
  salespersonCode?: string;
  isAdmin: boolean;
  analysisType?: 'comprehensive' | 'executive' | 'operational';
}

interface CustomerInsight {
  customer_code: string;
  customer_name: string;
  weekly_turnover: number;
  tier_classification: string;
  yoy_growth_percent: number;
  is_new_customer: boolean;
  is_at_risk: boolean;
}

interface ItemInsight {
  item_code: string;
  item_description: string;
  weekly_volume: number;
  weekly_turnover: number;
  trend_classification: string;
  spike_indicator: boolean;
  drop_indicator: boolean;
  first_sale_this_week: boolean;
}

interface EnhancedWeeklyData {
  week_summary: {
    year: number;
    week_number: number;
    total_turnover: number;
    total_margin: number;
    total_customers: number;
    total_transactions: number;
    avg_order_value: number;
    new_customers_count: number;
    at_risk_customers_count: number;
  };
  customer_insights: CustomerInsight[];
  item_insights: ItemInsight[];
  analytics_metadata: {
    generated_at: string;
    includes_trends: boolean;
    salesperson_filter: string;
    data_quality_score: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== Enhanced Weekly Insights Analysis Function Started ===');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const requestBody: EnhancedAnalysisRequest = await req.json();
    const { year, week, salespersonCode, isAdmin, analysisType = 'comprehensive' } = requestBody;
    
    console.log('Request parameters:', { year, week, salespersonCode, isAdmin, analysisType });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch enhanced weekly insights data
    console.log('Fetching enhanced weekly insights data...');
    
    // Try enhanced function first, fallback to standard if needed
    let enhancedData;
    let enhancedError;
    
    try {
      const result = await supabase.rpc(
        'get_enhanced_weekly_insights_v2',
        {
          p_year: year,
          p_week: week,
          p_salesperson_code: salespersonCode,
          p_is_admin: isAdmin,
          p_include_trends: true
        }
      );
      enhancedData = result.data;
      enhancedError = result.error;
    } catch (error) {
      console.log('Enhanced function not available, falling back to standard analysis');
      // If enhanced function doesn't exist, use standard weekly insights
      const fallbackResult = await supabase.rpc(
        'get_weekly_insights',
        {
          p_year: year,
          p_week: week,
          p_salesperson_code: salespersonCode,
          p_is_admin: isAdmin
        }
      );
      
      if (fallbackResult.error) {
        console.error('Fallback data fetch error:', fallbackResult.error);
        throw new Error(`Failed to fetch data: ${fallbackResult.error.message}`);
      }
      
      // Transform standard data to enhanced format
      enhancedData = {
        week_summary: fallbackResult.data.summary || {},
        customer_insights: fallbackResult.data.customer_insights || [],
        item_insights: fallbackResult.data.item_insights || [],
        analytics_metadata: {
          generated_at: new Date().toISOString(),
          includes_trends: false,
          salesperson_filter: salespersonCode || 'all',
          data_quality_score: 85
        }
      };
    }

    if (enhancedError) {
      console.error('Enhanced data fetch error:', enhancedError);
      throw new Error(`Failed to fetch enhanced data: ${enhancedError.message}`);
    }

    console.log('✓ Enhanced data fetched successfully');
    console.log('Data structure keys:', Object.keys(enhancedData || {}));

    const weeklyData = enhancedData as EnhancedWeeklyData;

    // Prepare intelligent data sample for AI
    const intelligentDataSample = prepareIntelligentDataSample(weeklyData, analysisType);
    
    console.log('Intelligent data sample prepared:');
    console.log('- Summary metrics included');
    console.log('- Significant changes:', intelligentDataSample.significant_changes?.length || 0);
    console.log('- Alerts generated:', intelligentDataSample.alerts?.length || 0);
    console.log('- Anomalies detected:', intelligentDataSample.anomalies?.length || 0);

    // Generate adaptive AI prompt based on data patterns
    const analysisPrompt = generateAdaptivePrompt(intelligentDataSample, analysisType, year, week);
    const systemPrompt = getSystemPrompt(analysisType);

    console.log('Calling OpenAI API with enhanced data...');
    
    // Call OpenAI API with intelligent data sample
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 3500,
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

    console.log('✓ Enhanced AI analysis completed successfully');
    console.log('Analysis type:', analysisType);
    console.log('Analysis length:', analysis?.length || 0, 'characters');

    const result = {
      analysis,
      analysisType: 'enhanced_v2',
      dataStructure: 'intelligent_sample',
      enhancedMetrics: {
        total_customers_analyzed: weeklyData.customer_insights?.length || 0,
        at_risk_customers: weeklyData.customer_insights?.filter(c => c.is_at_risk)?.length || 0,
        new_customers: weeklyData.customer_insights?.filter(c => c.is_new_customer)?.length || 0,
        spike_items: weeklyData.item_insights?.filter(i => i.spike_indicator)?.length || 0,
        drop_items: weeklyData.item_insights?.filter(i => i.drop_indicator)?.length || 0,
        new_items: weeklyData.item_insights?.filter(i => i.first_sale_this_week)?.length || 0,
      },
      dataQuality: {
        completeness_score: calculateDataCompleteness(weeklyData),
        accuracy_indicators: intelligentDataSample.data_quality_indicators,
        sample_efficiency: intelligentDataSample.sample_size_reduction_percent,
      },
      timestamp: new Date().toISOString()
    };

    console.log('=== Enhanced function completed successfully ===');

    return new Response(
      JSON.stringify(result), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('=== Enhanced function error ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        details: 'Check enhanced function logs for more information'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// =====================================================
// Helper Functions
// =====================================================

function prepareIntelligentDataSample(data: EnhancedWeeklyData, analysisType: string) {
  const summary = data.week_summary;
  const customers = data.customer_insights || [];
  const items = data.item_insights || [];

  // Extract significant changes (>20% variance)
  const significantCustomerChanges = customers.filter(c => 
    Math.abs(c.yoy_growth_percent) > 20 || c.is_at_risk || c.is_new_customer
  ).slice(0, 15); // Limit to top 15 for token efficiency

  const significantItemChanges = items.filter(i =>
    i.spike_indicator || i.drop_indicator || i.first_sale_this_week || 
    ['growing', 'declining', 'new', 'lost'].includes(i.trend_classification)
  ).slice(0, 15);

  // Generate business alerts
  const alerts = generateBusinessAlerts(summary, customers, items);

  // Detect anomalies
  const anomalies = detectAnomalies(customers, items);

  // Data quality indicators
  const dataQualityIndicators = {
    customer_data_completeness: customers.length > 0 ? 100 : 0,
    item_data_completeness: items.length > 0 ? 100 : 0,
    margin_data_availability: summary.total_margin > 0 ? 100 : 0,
    trend_analysis_coverage: (customers.filter(c => c.tier_classification).length / Math.max(customers.length, 1)) * 100,
  };

  const originalDataSize = customers.length + items.length;
  const sampleDataSize = significantCustomerChanges.length + significantItemChanges.length;
  const sampleSizeReduction = originalDataSize > 0 ? ((originalDataSize - sampleDataSize) / originalDataSize * 100) : 0;

  return {
    summary_metrics: summary,
    significant_changes: {
      customers: significantCustomerChanges,
      items: significantItemChanges,
    },
    alerts,
    anomalies,
    data_quality_indicators: dataQualityIndicators,
    sample_size_reduction_percent: sampleSizeReduction,
    analysis_focus_areas: determineAnalysisFocusAreas(alerts, anomalies, analysisType),
  };
}

function generateBusinessAlerts(summary: any, customers: CustomerInsight[], items: ItemInsight[]) {
  const alerts = [];

  // Customer risk alerts
  const atRiskCount = customers.filter(c => c.is_at_risk).length;
  const newCustomerCount = customers.filter(c => c.is_new_customer).length;
  
  if (atRiskCount > 0) {
    alerts.push({
      type: 'customer_risk',
      severity: atRiskCount > 5 ? 'critical' : 'high',
      message: `${atRiskCount} customers are at risk of churn`,
      action_required: 'immediate_contact',
      affected_revenue: customers.filter(c => c.is_at_risk).reduce((sum, c) => sum + c.weekly_turnover, 0)
    });
  }

  // New customer opportunities
  if (newCustomerCount > 0) {
    alerts.push({
      type: 'customer_opportunity',
      severity: 'medium',
      message: `${newCustomerCount} new meaningful customers acquired`,
      action_required: 'nurture_relationship',
      potential_value: customers.filter(c => c.is_new_customer).reduce((sum, c) => sum + c.weekly_turnover, 0)
    });
  }

  // Product performance alerts
  const spikeItems = items.filter(i => i.spike_indicator);
  const dropItems = items.filter(i => i.drop_indicator);
  
  if (spikeItems.length > 0) {
    alerts.push({
      type: 'inventory_spike',
      severity: 'medium',
      message: `${spikeItems.length} items showing unusual demand spikes`,
      action_required: 'inventory_review',
      affected_items: spikeItems.length
    });
  }

  if (dropItems.length > 0) {
    alerts.push({
      type: 'inventory_drop',
      severity: 'high',
      message: `${dropItems.length} items showing significant demand drops`,
      action_required: 'market_analysis',
      affected_items: dropItems.length
    });
  }

  return alerts;
}

function detectAnomalies(customers: CustomerInsight[], items: ItemInsight[]) {
  const anomalies = [];

  // Customer anomalies - extreme YoY changes
  const extremeGrowthCustomers = customers.filter(c => c.yoy_growth_percent > 200);
  const extremeDeclineCustomers = customers.filter(c => c.yoy_growth_percent < -50);

  if (extremeGrowthCustomers.length > 0) {
    anomalies.push({
      type: 'extreme_customer_growth',
      count: extremeGrowthCustomers.length,
      description: 'Customers with >200% YoY growth',
      requires_investigation: true
    });
  }

  if (extremeDeclineCustomers.length > 0) {
    anomalies.push({
      type: 'extreme_customer_decline',
      count: extremeDeclineCustomers.length,
      description: 'Customers with >50% YoY decline',
      requires_investigation: true
    });
  }

  return anomalies;
}

function determineAnalysisFocusAreas(alerts: any[], anomalies: any[], analysisType: string) {
  const focusAreas = ['performance_summary'];

  if (alerts.some(a => a.type === 'customer_risk')) {
    focusAreas.push('customer_retention');
  }

  if (alerts.some(a => a.type.includes('inventory'))) {
    focusAreas.push('inventory_optimization');
  }

  if (anomalies.length > 0) {
    focusAreas.push('anomaly_investigation');
  }

  if (analysisType === 'executive') {
    focusAreas.push('strategic_recommendations');
  }

  return focusAreas;
}

function generateAdaptivePrompt(dataPackage: any, analysisType: string, year: number, week: number) {
  let basePrompt = `You are an expert sales analyst. Analyze this intelligently sampled weekly sales data for Week ${week} of ${year}. Focus on actionable insights and specific recommendations.

ENHANCED WEEKLY SALES DATA:
${JSON.stringify(dataPackage, null, 2)}

`;

  // Add focus-specific sections based on data patterns
  if (dataPackage.alerts?.length > 0) {
    basePrompt += `
🚨 CRITICAL ALERTS DETECTED - PRIORITIZE THESE AREAS:
${dataPackage.alerts.map(alert => `• ${alert.message} (${alert.severity} severity)`).join('\n')}

`;
  }

  if (dataPackage.anomalies?.length > 0) {
    basePrompt += `
🔍 ANOMALIES REQUIRE INVESTIGATION:
${dataPackage.anomalies.map(anomaly => `• ${anomaly.description} (${anomaly.count} instances)`).join('\n')}

`;
  }

  // Analysis type specific instructions
  if (analysisType === 'executive') {
    basePrompt += `
EXECUTIVE ANALYSIS REQUIREMENTS:
## 1. Executive Summary (3-4 bullet points)
## 2. Key Performance Indicators
## 3. Strategic Risks & Opportunities  
## 4. Immediate Action Items (next 7 days)
## 5. Monthly Strategic Recommendations
`;
  } else if (analysisType === 'operational') {
    basePrompt += `
OPERATIONAL ANALYSIS REQUIREMENTS:
## 1. Daily Operations Impact
## 2. Customer Contact Priorities
## 3. Inventory & Supply Chain Actions
## 4. Sales Team Directives
## 5. Performance Monitoring Points
`;
  } else {
    basePrompt += `
COMPREHENSIVE ANALYSIS REQUIREMENTS:
## 1. Weekly Performance Overview
## 2. Customer Intelligence & Risk Analysis
## 3. Product Performance & Trends
## 4. Business Alerts & Anomalies
## 5. Actionable Recommendations
## 6. Next Week Predictions & Focus Areas
`;
  }

  basePrompt += `
FORMAT REQUIREMENTS:
- Use clear headings and bullet points
- Include specific numbers and percentages
- Provide actionable recommendations with priorities
- Highlight urgent items with 🚨 emoji
- Use 📈/📉 for trends, ⚠️ for risks, ✅ for opportunities
- Keep executive items concise, operational items detailed
`;

  return basePrompt;
}

function getSystemPrompt(analysisType: string) {
  const baseSystem = 'You are a seasoned sales analyst with expertise in business intelligence, customer behavior analysis, and strategic planning.';
  
  if (analysisType === 'executive') {
    return `${baseSystem} Focus on high-level strategic insights for executive decision-making. Prioritize business impact, risks, and opportunities. Be concise but comprehensive.`;
  } else if (analysisType === 'operational') {
    return `${baseSystem} Focus on day-to-day operational insights for sales teams and customer service. Prioritize immediate actions, customer contacts, and process improvements.`;
  } else {
    return `${baseSystem} Provide comprehensive analysis covering both strategic and operational aspects. Balance detailed insights with actionable recommendations.`;
  }
}

function calculateDataCompleteness(data: EnhancedWeeklyData) {
  let score = 0;
  let maxScore = 0;

  // Summary data completeness
  if (data.week_summary) {
    score += 25;
    if (data.week_summary.total_turnover > 0) score += 10;
    if (data.week_summary.total_margin > 0) score += 10;
    if (data.week_summary.total_customers > 0) score += 5;
  }
  maxScore += 50;

  // Customer insights completeness
  if (data.customer_insights && data.customer_insights.length > 0) {
    score += 25;
    const customersWithTiers = data.customer_insights.filter(c => c.tier_classification).length;
    score += (customersWithTiers / data.customer_insights.length) * 15;
  }
  maxScore += 40;

  // Item insights completeness
  if (data.item_insights && data.item_insights.length > 0) {
    score += 10;
  }
  maxScore += 10;

  return Math.round((score / maxScore) * 100);
}