import { useState, useEffect } from 'react';
import { LeadCenter } from '@/types/leadCenter';
import { useAILeadBatch } from '@/hooks/useAILeadScoring';
import { getChannelInfo } from '@/utils/channelMapping';

interface ChannelMetrics {
  channel: string;
  channelName: string;
  leadsCount: number;
  avgScore: number;
  conversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
  category: string;
}

interface ProductRecommendation {
  product: string;
  channels: string[];
  compatibility: number;
  volume: number;
}

export const useChannelIntelligence = (leads: LeadCenter[]) => {
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetrics[]>([]);
  const [productRecommendations, setProductRecommendations] = useState<ProductRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isProcessing, generateChannelReport } = useAILeadBatch();

  useEffect(() => {
    if (leads.length > 0) {
      generateChannelMetrics();
    }
  }, [leads]);

  const generateChannelMetrics = async () => {
    setIsLoading(true);
    
    try {
      // Generate AI-powered channel report
      const report = await generateChannelReport(leads);
      
      // Convert to chart-friendly format
      const metrics: ChannelMetrics[] = [];
      
      for (const [channel, performance] of report.channelPerformance.entries()) {
        const channelInfo = getChannelInfo(channel);
        const channelLeads = leads.filter(l => l.customer_channel === channel);
        
        const wonLeads = channelLeads.filter(l => l.status === 'closed_won');
        const avgDealSize = wonLeads.length > 0 
          ? wonLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0) / wonLeads.length
          : 0;
        
        // Calculate average sales cycle
        const avgSalesCycle = wonLeads.length > 0
          ? wonLeads.reduce((sum, l) => {
              const created = new Date(l.created_at);
              const updated = new Date(l.updated_at);
              return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            }, 0) / wonLeads.length
          : 0;
        
        metrics.push({
          channel,
          channelName: channelInfo?.name || channel,
          leadsCount: performance.count,
          avgScore: performance.avgScore,
          conversionRate: performance.conversionRate,
          avgDealSize,
          avgSalesCycle,
          category: channelInfo?.category || 'other',
        });
      }
      
      setChannelMetrics(metrics.sort((a, b) => b.avgScore - a.avgScore));
      
      // Generate product recommendations
      generateProductRecommendations(metrics);
      
    } catch (error) {
      console.error('Failed to generate channel metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateProductRecommendations = (metrics: ChannelMetrics[]) => {
    // Sample product recommendations based on channel performance
    const recommendations: ProductRecommendation[] = [
      {
        product: 'Premium Vanilla Extract',
        channels: ['HTL-FIV', 'RES-FRA'],
        compatibility: 95,
        volume: 120,
      },
      {
        product: 'Artisanal Spice Blends',
        channels: ['HTL-FIV', 'RES-ITA', 'RES-FRA'],
        compatibility: 88,
        volume: 85,
      },
      {
        product: 'Organic Herbs',
        channels: ['RES-ITA', 'RES-FRA', 'HTL-FOR'],
        compatibility: 82,
        volume: 95,
      },
      {
        product: 'Specialty Oils',
        channels: ['RES-ITA', 'HTL-FIV'],
        compatibility: 90,
        volume: 75,
      },
    ];
    
    setProductRecommendations(recommendations);
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartData = channelMetrics.map(metric => ({
    channel: metric.channelName,
    score: metric.avgScore,
    conversion: metric.conversionRate,
    deals: metric.leadsCount,
    value: metric.avgDealSize / 1000, // Convert to thousands
  }));

  const categoryData = channelMetrics.reduce((acc, metric) => {
    const existing = acc.find(item => item.category === metric.category);
    if (existing) {
      existing.value += metric.leadsCount;
    } else {
      acc.push({
        category: metric.category,
        value: metric.leadsCount,
        name: metric.category.charAt(0).toUpperCase() + metric.category.slice(1),
      });
    }
    return acc;
  }, [] as Array<{ category: string; value: number; name: string }>);

  return {
    channelMetrics,
    productRecommendations,
    isLoading,
    isProcessing,
    chartData,
    categoryData,
    generateChannelMetrics,
    getPerformanceColor,
    formatCurrency,
  };
};