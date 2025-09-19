import { useState, useEffect, useCallback } from 'react';
import { LeadCenter } from '@/types/leadCenter';
import { aiLeadScoringService, LeadScoringResult, ChannelCompatibilityScore } from '@/services/aiLeadScoring';
import { useToast } from '@/hooks/use-toast';

export interface AILeadInsights {
  leadScore: LeadScoringResult | null;
  channelScore: ChannelCompatibilityScore | null;
  conversionProbability: number | null;
  nextAction: string | null;
  productRecommendations: string[];
  isLoading: boolean;
  error: string | null;
}

export interface AILeadScoringHook {
  insights: AILeadInsights;
  refreshInsights: () => Promise<void>;
  scoreMultipleLeads: (leads: LeadCenter[]) => Promise<Map<string, LeadScoringResult>>;
  updateLeadPriority: (leadId: string, aiScore: number) => Promise<void>;
}

export const useAILeadScoring = (lead?: LeadCenter): AILeadScoringHook => {
  const [insights, setInsights] = useState<AILeadInsights>({
    leadScore: null,
    channelScore: null,
    conversionProbability: null,
    nextAction: null,
    productRecommendations: [],
    isLoading: false,
    error: null,
  });

  const { toast } = useToast();

  const refreshInsights = useCallback(async () => {
    if (!lead) {
      setInsights(prev => ({ ...prev, error: 'No lead provided' }));
      return;
    }

    setInsights(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [leadScore, channelScore, conversionProbability, nextAction, productRecommendations] = await Promise.all([
        aiLeadScoringService.scoreLeadWithAI(lead),
        lead.customer_channel ? aiLeadScoringService.calculateChannelCompatibility(lead.customer_channel) : null,
        aiLeadScoringService.predictConversionProbability(lead),
        aiLeadScoringService.suggestNextAction(lead),
        aiLeadScoringService.recommendProducts(lead.customer_channel || ''),
      ]);

      setInsights({
        leadScore,
        channelScore,
        conversionProbability,
        nextAction,
        productRecommendations,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load AI insights';
      setInsights(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('AI Lead Scoring Error:', error);
    }
  }, [lead]);

  const scoreMultipleLeads = useCallback(async (leads: LeadCenter[]): Promise<Map<string, LeadScoringResult>> => {
    const scoreMap = new Map<string, LeadScoringResult>();
    
    try {
      // Process leads in batches to avoid overwhelming the system
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < leads.length; i += batchSize) {
        batches.push(leads.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (lead) => {
          try {
            const score = await aiLeadScoringService.scoreLeadWithAI(lead);
            return { leadId: lead.id, score };
          } catch (error) {
            console.warn(`Failed to score lead ${lead.id}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(result => {
          if (result) {
            scoreMap.set(result.leadId, result.score);
          }
        });
      }

      toast({
        title: "AI Scoring Complete",
        description: `Scored ${scoreMap.size} of ${leads.length} leads`,
      });

      return scoreMap;
    } catch (error: any) {
      toast({
        title: "Scoring Error",
        description: error.message || "Failed to score leads",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateLeadPriority = useCallback(async (leadId: string, aiScore: number): Promise<void> => {
    try {
      // Auto-adjust priority based on AI score
      let suggestedPriority: 'Low' | 'Medium' | 'High';
      
      if (aiScore >= 80) {
        suggestedPriority = 'High';
      } else if (aiScore >= 60) {
        suggestedPriority = 'Medium';
      } else {
        suggestedPriority = 'Low';
      }

      // Note: This would typically update the lead in the database
      // For now, we'll just show a toast with the recommendation
      toast({
        title: "Priority Suggestion",
        description: `Based on AI score of ${aiScore}, consider setting priority to ${suggestedPriority}`,
      });
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message || "Failed to update lead priority",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Load insights when lead changes
  useEffect(() => {
    if (lead) {
      refreshInsights();
    }
  }, [lead?.id, refreshInsights]);

  return {
    insights,
    refreshInsights,
    scoreMultipleLeads,
    updateLeadPriority,
  };
};

// Hook for batch AI operations on multiple leads
export const useAILeadBatch = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const scoreLeadsBatch = useCallback(async (leads: LeadCenter[]): Promise<Map<string, LeadScoringResult>> => {
    setIsProcessing(true);
    setProgress(0);
    
    const scoreMap = new Map<string, LeadScoringResult>();
    
    try {
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        
        try {
          const score = await aiLeadScoringService.scoreLeadWithAI(lead);
          scoreMap.set(lead.id, score);
        } catch (error) {
          console.warn(`Failed to score lead ${lead.id}:`, error);
        }
        
        setProgress(Math.round(((i + 1) / leads.length) * 100));
      }

      toast({
        title: "Batch Scoring Complete",
        description: `Processed ${scoreMap.size} of ${leads.length} leads`,
      });

      return scoreMap;
    } catch (error: any) {
      toast({
        title: "Batch Processing Error",
        description: error.message || "Failed to process lead batch",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [toast]);

  const generateChannelReport = useCallback(async (leads: LeadCenter[]): Promise<{
    channelPerformance: Map<string, { avgScore: number; count: number; conversionRate: number }>;
    topChannels: Array<{ channel: string; avgScore: number; count: number }>;
    recommendations: string[];
  }> => {
    setIsProcessing(true);
    
    try {
      const channelData = new Map<string, { scores: number[]; leads: LeadCenter[] }>();
      
      // Group leads by channel
      leads.forEach(lead => {
        const channel = lead.customer_channel || 'Unknown';
        if (!channelData.has(channel)) {
          channelData.set(channel, { scores: [], leads: [] });
        }
        channelData.get(channel)!.leads.push(lead);
      });

      // Score leads by channel
      const channelPerformance = new Map<string, { avgScore: number; count: number; conversionRate: number }>();
      
      for (const [channel, data] of channelData.entries()) {
        let totalScore = 0;
        let scoredCount = 0;
        
        for (const lead of data.leads) {
          try {
            const result = await aiLeadScoringService.scoreLeadWithAI(lead);
            totalScore += result.score;
            scoredCount++;
          } catch (error) {
            console.warn(`Failed to score lead for channel analysis:`, error);
          }
        }
        
        const avgScore = scoredCount > 0 ? totalScore / scoredCount : 0;
        const wonLeads = data.leads.filter(l => l.status === 'closed_won').length;
        const conversionRate = data.leads.length > 0 ? (wonLeads / data.leads.length) * 100 : 0;
        
        channelPerformance.set(channel, {
          avgScore,
          count: data.leads.length,
          conversionRate,
        });
      }

      // Get top performing channels
      const topChannels = Array.from(channelPerformance.entries())
        .map(([channel, data]) => ({
          channel,
          avgScore: data.avgScore,
          count: data.count,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5);

      // Generate recommendations
      const recommendations = [
        `Focus on ${topChannels[0]?.channel || 'high-scoring channels'} which shows highest AI compatibility`,
        'Consider channel-specific marketing strategies for top performing segments',
        'Review and optimize approach for lower-scoring channels',
      ];

      return {
        channelPerformance,
        topChannels,
        recommendations,
      };
    } catch (error: any) {
      toast({
        title: "Report Generation Error",
        description: error.message || "Failed to generate channel report",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    isProcessing,
    progress,
    scoreLeadsBatch,
    generateChannelReport,
  };
};