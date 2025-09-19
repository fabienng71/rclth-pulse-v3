import { LeadCenter, ChannelProductMatrix } from '@/types/leadCenter';
import { CHANNEL_MAPPING } from '@/utils/channelMapping';
import { supabase } from '@/lib/supabase';

export interface LeadScoringResult {
  score: number; // 0-100
  confidence: number; // 0-1
  factors: {
    channelCompatibility: number;
    categoryCompatibility: number; // New factor
    estimatedValue: number;
    priority: number;
    salesStage: number;
    timeFactors: number;
  };
  recommendations: {
    products: string[];
    nextActions: string[];
    timeline: string;
  };
  categoryInsights?: {
    topCategories: Array<{
      posting_group: string;
      score: number;
      reasoning: string;
    }>;
    potentialValue: number;
  };
}

export interface ChannelCompatibilityScore {
  channel: string;
  score: number;
  reasoning: string;
  recommendedProducts: string[];
  typicalOrderSize: string;
  salesCycleLength: string;
}

class AILeadScoringService {
  private readonly SCORING_WEIGHTS = {
    channelCompatibility: 0.25,
    categoryCompatibility: 0.25, // New factor for product category fit
    estimatedValue: 0.20,
    priority: 0.15,
    salesStage: 0.10,
    timeFactors: 0.05,
  };

  /**
   * Main lead scoring function combining multiple factors
   */
  async scoreLeadWithAI(lead: LeadCenter): Promise<LeadScoringResult> {
    const factors = await this.calculateScoringFactors(lead);
    
    const weightedScore = 
      factors.channelCompatibility * this.SCORING_WEIGHTS.channelCompatibility +
      factors.categoryCompatibility * this.SCORING_WEIGHTS.categoryCompatibility +
      factors.estimatedValue * this.SCORING_WEIGHTS.estimatedValue +
      factors.priority * this.SCORING_WEIGHTS.priority +
      factors.salesStage * this.SCORING_WEIGHTS.salesStage +
      factors.timeFactors * this.SCORING_WEIGHTS.timeFactors;

    const recommendations = await this.generateRecommendations(lead, factors);
    
    return {
      score: Math.round(weightedScore),
      confidence: this.calculateConfidence(factors),
      factors,
      recommendations,
    };
  }

  /**
   * Calculate channel compatibility score for a specific customer channel
   */
  async calculateChannelCompatibility(customerChannel: string): Promise<ChannelCompatibilityScore> {
    if (!customerChannel || !CHANNEL_MAPPING[customerChannel]) {
      return {
        channel: customerChannel || 'unknown',
        score: 20,
        reasoning: 'Unknown or unspecified customer channel',
        recommendedProducts: [],
        typicalOrderSize: 'Unknown',
        salesCycleLength: 'Unknown',
      };
    }

    const channelInfo = CHANNEL_MAPPING[customerChannel];
    
    // Get channel-specific data from database
    const channelMatrix = await this.getChannelProductMatrix(customerChannel);
    
    // Calculate base score based on channel type and historical data
    const baseScore = this.getChannelBaseScore(channelInfo.category);
    
    // Adjust based on historical performance
    const historicalPerformance = await this.getChannelHistoricalPerformance(customerChannel);
    const performanceAdjustment = historicalPerformance.conversionRate * 30; // Max 30 point bonus
    
    const finalScore = Math.min(100, baseScore + performanceAdjustment);
    
    return {
      channel: customerChannel,
      score: Math.round(finalScore),
      reasoning: this.generateChannelReasoning(channelInfo, historicalPerformance),
      recommendedProducts: await this.getRecommendedProducts(customerChannel),
      typicalOrderSize: channelMatrix?.typical_order_size || 'Medium',
      salesCycleLength: channelMatrix?.sales_cycle_length || '2-4 weeks',
    };
  }

  /**
   * Generate product recommendations based on customer channel
   */
  async recommendProducts(customerChannel: string): Promise<string[]> {
    if (!customerChannel || !CHANNEL_MAPPING[customerChannel]) {
      return [];
    }

    const channelInfo = CHANNEL_MAPPING[customerChannel];
    
    // Channel-specific product recommendations
    const productMap: Record<string, string[]> = {
      'HTL-FIV': ['Premium Vanilla Extract', 'Organic Spice Blends', 'Artisanal Chocolate', 'Truffle Oil'],
      'HTL-FOR': ['Standard Vanilla Extract', 'Spice Mixes', 'Chocolate Chips', 'Cooking Oils'],
      'HTL-LES': ['Basic Flavoring', 'Essential Spices', 'Standard Chocolate', 'Vegetable Oil'],
      'RES-FRA': ['French Herbs', 'Wine Reductions', 'Gourmet Salts', 'Artisanal Butter'],
      'RES-ITA': ['Italian Herbs', 'Olive Oil', 'Parmesan', 'Balsamic Vinegar'],
      'RES-JPN': ['Miso Paste', 'Soy Sauce', 'Wasabi', 'Seaweed'],
      'RES-SHO': ['Meat Tenderizers', 'BBQ Spices', 'Marinades', 'Specialty Salts'],
      'RET-BPA': ['Baking Powder', 'Yeast', 'Flour Improvers', 'Cake Mixes'],
      'RET-ICE': ['Dairy Bases', 'Flavor Concentrates', 'Stabilizers', 'Color Additives'],
      'RET-SMK': ['Bulk Spices', 'Preservatives', 'Flavor Enhancers', 'Food Colorings'],
      'OTH-BPC': ['Coffee Extracts', 'Syrups', 'Flavor Shots', 'Milk Alternatives'],
      'OTH-DST': ['Bulk Ingredients', 'Industrial Flavors', 'Preservatives', 'Additives'],
      'OTH-IND': ['Food Grade Chemicals', 'Bulk Flavors', 'Preservatives', 'Processing Aids'],
      'OTH-CAE': ['Bulk Spices', 'Sauces', 'Pre-made Mixes', 'Catering Supplies'],
    };

    return productMap[customerChannel] || [];
  }

  /**
   * Predict conversion probability based on lead characteristics
   */
  async predictConversionProbability(lead: LeadCenter): Promise<number> {
    const factors = await this.calculateScoringFactors(lead);
    
    // Base probability from current close_probability field
    const baseProbability = lead.close_probability || 20;
    
    // Adjust based on AI factors
    const channelBonus = (factors.channelCompatibility - 50) * 0.4; // ±20%
    const stageBonus = this.getStageProbabilityBonus(lead.status);
    const valueBonus = factors.estimatedValue > 70 ? 10 : 0;
    
    const adjustedProbability = baseProbability + channelBonus + stageBonus + valueBonus;
    
    return Math.min(95, Math.max(5, Math.round(adjustedProbability)));
  }

  /**
   * Suggest next best action based on lead state and AI analysis
   */
  async suggestNextAction(lead: LeadCenter): Promise<string> {
    // Get customer channel - try lead's stored channel first, then fetch from customers table
    let customerChannel = lead.customer_channel;
    
    if (!customerChannel && lead.customer_id) {
      try {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('customer_type_code')
          .eq('customer_code', lead.customer_id)
          .single();
        
        if (!error && customer?.customer_type_code) {
          customerChannel = customer.customer_type_code;
        }
      } catch (error) {
        console.warn('⚠️ AI Next Action: Failed to fetch customer channel:', error);
      }
    }
    
    const channelCompatibility = await this.calculateChannelCompatibility(customerChannel || '');
    const daysSinceUpdate = this.getDaysSinceUpdate(lead.updated_at);
    
    // Stage-based recommendations
    const stageActions: Record<string, string[]> = {
      'contacted': [
        'Schedule initial meeting to understand requirements',
        'Send product catalog tailored to their channel',
        'Research company background and decision makers',
      ],
      'meeting_scheduled': [
        'Prepare channel-specific presentation',
        'Gather detailed requirements and volume needs',
        'Identify key decision makers and influencers',
      ],
      'samples_sent': [
        'Follow up on sample evaluation progress',
        'Schedule tasting session or trial period',
        'Provide technical support for sample testing',
      ],
      'samples_followed_up': [
        'Request feedback on sample quality and fit',
        'Discuss pricing and volume requirements',
        'Prepare formal quotation',
      ],
      'negotiating': [
        'Finalize pricing and terms',
        'Address any remaining concerns',
        'Prepare contract and delivery timeline',
      ],
      'closed_won': [
        'Process order and confirm delivery schedule',
        'Set up account management and support',
        'Plan for future business expansion',
      ],
      'closed_lost': [
        'Conduct post-mortem analysis',
        'Schedule follow-up for future opportunities',
        'Maintain relationship for referrals',
      ],
    };

    const stageSpecificActions = stageActions[lead.status] || ['Review lead status and update next steps'];
    
    // Add urgency based on time factors
    if (daysSinceUpdate > 7) {
      return `URGENT: ${stageSpecificActions[0]} (No activity for ${daysSinceUpdate} days)`;
    }
    
    // Channel-specific adjustments
    if (channelCompatibility.score < 40) {
      return `Consider channel fit: ${channelCompatibility.reasoning}. ${stageSpecificActions[0]}`;
    }
    
    return stageSpecificActions[0];
  }

  // Private helper methods
  private async calculateScoringFactors(lead: LeadCenter): Promise<LeadScoringResult['factors']> {
    // Get customer channel - try lead's stored channel first, then fetch from customers table
    let customerChannel = lead.customer_channel;
    
    if (!customerChannel && lead.customer_id) {
      console.log('🔍 AI Scoring: Fetching customer channel for lead:', lead.id);
      try {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('customer_type_code')
          .eq('customer_code', lead.customer_id)
          .single();
        
        if (!error && customer?.customer_type_code) {
          customerChannel = customer.customer_type_code;
          console.log('✅ AI Scoring: Found customer channel:', customerChannel);
        }
      } catch (error) {
        console.warn('⚠️ AI Scoring: Failed to fetch customer channel:', error);
      }
    }
    
    const channelCompatibility = customerChannel 
      ? (await this.calculateChannelCompatibility(customerChannel)).score
      : 20;
    
    const categoryCompatibility = await this.calculateCategoryCompatibility(lead);
    const estimatedValue = this.scoreEstimatedValue(lead.estimated_value || 0);
    const priority = this.scorePriority(lead.priority);
    const salesStage = this.scoreSalesStage(lead.status);
    const timeFactors = this.scoreTimeFactors(lead);
    
    return {
      channelCompatibility,
      categoryCompatibility,
      estimatedValue,
      priority,
      salesStage,
      timeFactors,
    };
  }

  private getChannelBaseScore(category: string): number {
    const categoryScores = {
      'hotel': 75,     // High-margin, recurring orders
      'restaurant': 70, // Good margins, regular orders
      'retail': 60,    // Volume but lower margins
      'other': 50,     // Varies widely
    };
    return categoryScores[category] || 40;
  }

  private async getChannelHistoricalPerformance(channel: string): Promise<{ conversionRate: number; avgDealSize: number }> {
    try {
      const { data, error } = await supabase
        .from('lead_center')
        .select('status, estimated_value')
        .eq('customer_channel', channel)
        .not('status', 'in', '(contacted,meeting_scheduled)'); // Only mature leads
      
      if (error || !data || data.length === 0) {
        return { conversionRate: 0.2, avgDealSize: 50000 }; // Default values
      }

      const totalLeads = data.length;
      const wonLeads = data.filter(l => l.status === 'closed_won').length;
      const conversionRate = totalLeads > 0 ? wonLeads / totalLeads : 0.2;
      
      const wonValues = data
        .filter(l => l.status === 'closed_won' && l.estimated_value)
        .map(l => l.estimated_value || 0);
      const avgDealSize = wonValues.length > 0 
        ? wonValues.reduce((sum, val) => sum + val, 0) / wonValues.length
        : 50000;

      return { conversionRate, avgDealSize };
    } catch (error) {
      console.error('Error fetching channel performance:', error);
      return { conversionRate: 0.2, avgDealSize: 50000 };
    }
  }

  private async getChannelProductMatrix(channel: string): Promise<ChannelProductMatrix | null> {
    try {
      const { data, error } = await supabase
        .from('channel_product_matrix')
        .select('*')
        .eq('customer_channel', channel)
        .single();
      
      return error ? null : data;
    } catch (error) {
      return null;
    }
  }

  private generateChannelReasoning(channelInfo: any, performance: { conversionRate: number; avgDealSize: number }): string {
    const conversionText = performance.conversionRate > 0.3 ? 'high' : performance.conversionRate > 0.15 ? 'moderate' : 'low';
    const dealSizeText = performance.avgDealSize > 100000 ? 'large' : performance.avgDealSize > 50000 ? 'medium' : 'small';
    
    return `${channelInfo.name} typically shows ${conversionText} conversion rates with ${dealSizeText} deal sizes. ${channelInfo.description}`;
  }

  private async getRecommendedProducts(channel: string): Promise<string[]> {
    return this.recommendProducts(channel);
  }

  private scoreEstimatedValue(value: number): number {
    if (value >= 200000) return 100;
    if (value >= 100000) return 85;
    if (value >= 50000) return 70;
    if (value >= 25000) return 55;
    if (value >= 10000) return 40;
    return 25;
  }

  private scorePriority(priority: string): number {
    const priorityScores = { 'High': 100, 'Medium': 60, 'Low': 30 };
    return priorityScores[priority] || 50;
  }

  private scoreSalesStage(stage: string): number {
    const stageScores = {
      'contacted': 20,
      'meeting_scheduled': 35,
      'samples_sent': 50,
      'samples_followed_up': 65,
      'negotiating': 80,
      'closed_won': 100,
      'closed_lost': 0,
    };
    return stageScores[stage] || 30;
  }

  private scoreTimeFactors(lead: LeadCenter): number {
    const daysSinceCreated = this.getDaysSinceCreated(lead.created_at);
    const daysSinceUpdate = this.getDaysSinceUpdate(lead.updated_at);
    
    // Fresher leads score higher, but not too fresh (need time to develop)
    let freshnessScore = 100;
    if (daysSinceCreated < 1) freshnessScore = 40; // Too new
    else if (daysSinceCreated <= 7) freshnessScore = 90; // Sweet spot
    else if (daysSinceCreated <= 30) freshnessScore = 80;
    else if (daysSinceCreated <= 90) freshnessScore = 60;
    else freshnessScore = 30; // Getting stale
    
    // Recent activity is good
    let activityScore = 100;
    if (daysSinceUpdate > 14) activityScore = 30;
    else if (daysSinceUpdate > 7) activityScore = 60;
    else if (daysSinceUpdate > 3) activityScore = 80;
    
    return (freshnessScore + activityScore) / 2;
  }

  private getDaysSinceCreated(createdAt: string): number {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  private getDaysSinceUpdate(updatedAt: string): number {
    return Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  private getStageProbabilityBonus(stage: string): number {
    const stageBonuses = {
      'contacted': 0,
      'meeting_scheduled': 5,
      'samples_sent': 10,
      'samples_followed_up': 15,
      'negotiating': 20,
      'closed_won': 0,
      'closed_lost': -50,
    };
    return stageBonuses[stage] || 0;
  }

  private calculateConfidence(factors: LeadScoringResult['factors']): number {
    // Higher confidence when we have more complete data
    let confidence = 0.5; // Base confidence
    
    if (factors.channelCompatibility > 30) confidence += 0.2;
    if (factors.estimatedValue > 40) confidence += 0.15;
    if (factors.salesStage > 35) confidence += 0.1;
    if (factors.timeFactors > 50) confidence += 0.05;
    
    return Math.min(1, confidence);
  }

  private async generateRecommendations(lead: LeadCenter, factors: LeadScoringResult['factors']): Promise<LeadScoringResult['recommendations']> {
    const products = await this.recommendProducts(lead.customer_channel || '');
    const nextActions = [await this.suggestNextAction(lead)];
    
    // Timeline based on stage and channel
    let timeline = '1-2 weeks';
    if (lead.status === 'negotiating') timeline = '3-5 days';
    else if (lead.status === 'samples_sent') timeline = '1-2 weeks';
    else if (lead.status === 'contacted') timeline = '2-4 weeks';
    
    return {
      products: products.slice(0, 4), // Top 4 recommendations
      nextActions,
      timeline,
    };
  }

  /**
   * Calculate category compatibility score based on lead's product interests
   */
  private async calculateCategoryCompatibility(lead: LeadCenter): Promise<number> {
    try {
      // Get lead's product interests from database
      const { data: interests, error } = await supabase
        .from('lead_product_interests')
        .select('*')
        .eq('lead_id', lead.id);

      if (error) {
        console.warn('Error fetching product interests:', error);
        return 50; // Default neutral score
      }

      if (!interests || interests.length === 0) {
        return 30; // Lower score for leads without specified interests
      }

      // Get category performance data for this channel
      let performance: any[] = [];
      try {
        const { data, error: perfError } = await supabase
          .rpc('get_category_performance_insights', {
            p_customer_channel: lead.customer_channel || null,
            p_posting_group: null
          });

        if (perfError) {
          console.warn('Error fetching category performance (function may not exist yet):', perfError);
          // Use fallback performance data
          performance = this.getFallbackCategoryPerformance(lead.customer_channel);
        } else {
          performance = data || [];
        }
      } catch (error) {
        console.warn('Category performance function not available, using fallback:', error);
        performance = this.getFallbackCategoryPerformance(lead.customer_channel);
      }

      let totalScore = 0;
      let weightedTotal = 0;

      for (const interest of interests) {
        const categoryPerf = performance?.find(
          p => p.posting_group === interest.posting_group && 
               p.customer_channel === lead.customer_channel
        );

        // Base score from interest level
        let categoryScore = this.getInterestLevelScore(interest.interest_level);

        // Adjust based on historical category performance
        if (categoryPerf) {
          const performanceBonus = categoryPerf.performance_score * 0.3; // Up to 30 point bonus
          categoryScore += performanceBonus;
        }

        // Adjust based on estimated volume fit
        if (interest.estimated_monthly_volume) {
          const volumeBonus = this.getVolumeFitScore(
            interest.estimated_monthly_volume, 
            interest.posting_group
          );
          categoryScore += volumeBonus;
        }

        // Weight by interest level
        const weight = this.getInterestWeight(interest.interest_level);
        totalScore += categoryScore * weight;
        weightedTotal += weight;
      }

      // Calculate weighted average
      const finalScore = weightedTotal > 0 ? totalScore / weightedTotal : 50;
      
      return Math.min(100, Math.max(0, Math.round(finalScore)));
    } catch (error) {
      console.error('Error calculating category compatibility:', error);
      return 50; // Default neutral score on error
    }
  }

  /**
   * Get score based on interest level
   */
  private getInterestLevelScore(level: string): number {
    switch (level) {
      case 'high': return 80;
      case 'medium': return 60;
      case 'low': return 40;
      default: return 50;
    }
  }

  /**
   * Get weight multiplier based on interest level
   */
  private getInterestWeight(level: string): number {
    switch (level) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  /**
   * Calculate volume fit score based on estimated volume and category
   */
  private getVolumeFitScore(estimatedVolume: number, postingGroup: string): number {
    // Define typical volume ranges for different categories
    const typicalVolumes: Record<string, { min: number; max: number; optimal: number }> = {
      'DAIRY': { min: 50, max: 500, optimal: 200 },
      'OILS': { min: 20, max: 200, optimal: 80 },
      'SPICES': { min: 10, max: 100, optimal: 40 },
      'MEAT': { min: 100, max: 1000, optimal: 400 },
      'BAKERY': { min: 80, max: 800, optimal: 300 },
      'CONDIMENTS': { min: 30, max: 300, optimal: 120 },
    };

    const categoryVolume = typicalVolumes[postingGroup];
    if (!categoryVolume) return 0;

    // Score based on how close estimated volume is to optimal
    const distanceFromOptimal = Math.abs(estimatedVolume - categoryVolume.optimal);
    const maxDistance = Math.max(
      categoryVolume.optimal - categoryVolume.min,
      categoryVolume.max - categoryVolume.optimal
    );

    const proximityScore = Math.max(0, 1 - (distanceFromOptimal / maxDistance));
    return proximityScore * 15; // Up to 15 point bonus
  }

  /**
   * Enhanced product recommendations including category-based suggestions
   */
  async getEnhancedProductRecommendations(lead: LeadCenter): Promise<{
    channelRecommendations: string[];
    categoryRecommendations: string[];
    crossSellOpportunities: string[];
  }> {
    // Get channel-based recommendations
    const channelRecommendations = await this.recommendProducts(lead.customer_channel || '');

    // Get category-based recommendations
    const { data: interests } = await supabase
      .from('lead_product_interests')
      .select('posting_group, specific_items, interest_level')
      .eq('lead_id', lead.id);

    const categoryRecommendations: string[] = [];
    const crossSellOpportunities: string[] = [];

    if (interests && interests.length > 0) {
      for (const interest of interests) {
        // Add specific items if selected
        if (interest.specific_items && interest.specific_items.length > 0) {
          categoryRecommendations.push(...interest.specific_items);
        }

        // Add category-based cross-sell opportunities
        const crossSellCategories = this.getCrossSellCategories(interest.posting_group);
        crossSellOpportunities.push(...crossSellCategories);
      }
    }

    return {
      channelRecommendations,
      categoryRecommendations: [...new Set(categoryRecommendations)], // Remove duplicates
      crossSellOpportunities: [...new Set(crossSellOpportunities)], // Remove duplicates
    };
  }

  /**
   * Get related categories for cross-selling
   */
  private getCrossSellCategories(postingGroup: string): string[] {
    const crossSellMap: Record<string, string[]> = {
      'DAIRY': ['BAKERY', 'CONDIMENTS'],
      'OILS': ['SPICES', 'CONDIMENTS'],
      'SPICES': ['OILS', 'MEAT'],
      'MEAT': ['SPICES', 'CONDIMENTS'],
      'BAKERY': ['DAIRY', 'SPICES'],
      'CONDIMENTS': ['OILS', 'SPICES'],
    };

    return crossSellMap[postingGroup] || [];
  }

  /**
   * Fallback category performance data when database function is not available
   */
  private getFallbackCategoryPerformance(customerChannel?: string): any[] {
    // Default performance data for common category-channel combinations
    const fallbackData = [
      { posting_group: 'DAIRY', customer_channel: 'HTL-FIV', performance_score: 85, conversion_rate: 75, avg_deal_size: 85000 },
      { posting_group: 'OILS', customer_channel: 'HTL-FIV', performance_score: 82, conversion_rate: 80, avg_deal_size: 65000 },
      { posting_group: 'SPICES', customer_channel: 'RES-FRA', performance_score: 78, conversion_rate: 70, avg_deal_size: 45000 },
      { posting_group: 'MEAT', customer_channel: 'RES-ITA', performance_score: 75, conversion_rate: 65, avg_deal_size: 75000 },
      { posting_group: 'BAKERY', customer_channel: 'RET-BPA', performance_score: 88, conversion_rate: 85, avg_deal_size: 35000 },
      { posting_group: 'DAIRY', customer_channel: 'RES-FRA', performance_score: 76, conversion_rate: 72, avg_deal_size: 55000 },
      { posting_group: 'OILS', customer_channel: 'RES-ITA', performance_score: 79, conversion_rate: 78, avg_deal_size: 48000 },
    ];

    if (customerChannel) {
      return fallbackData.filter(item => item.customer_channel === customerChannel);
    }

    return fallbackData;
  }
}

// Export singleton instance
export const aiLeadScoringService = new AILeadScoringService();
export default aiLeadScoringService;