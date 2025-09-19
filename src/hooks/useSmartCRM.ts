// Smart CRM React Hooks
// Custom hooks for Activity-Lead Integration System

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Activity } from '@/types/activity';
import { LeadCenter } from '@/types/leadCenter';
import {
  LeadScoringResult,
  LeadCreationRules,
  LeadCreationParams,
  LeadCreationResult,
  TimelineEvent,
  SmartCRMMetrics,
  ScoringBreakdown,
  UseLeadIntelligenceReturn,
  UseLeadCreationRulesReturn,
  UseSmartCRMMetricsReturn,
  UseUnifiedTimelineReturn,
  UseLeadCreationReturn,
  SMART_CRM_CONSTANTS
} from '@/types/smartCRM';
import SmartCRMService from '@/services/smartCRMService';

// ==========================================
// 1. LEAD INTELLIGENCE HOOK
// ==========================================

/**
 * Hook for real-time lead intelligence scoring
 */
export const useLeadIntelligence = (activity: Partial<Activity>): UseLeadIntelligenceReturn => {
  const [score, setScore] = useState<number>(0);
  const [scoringResult, setScoringResult] = useState<LeadScoringResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the essential fields to prevent unnecessary recalculations
  const activityKey = useMemo(() => {
    return JSON.stringify({
      activity_type: activity.activity_type,
      pipeline_stage: activity.pipeline_stage,
      notes: activity.notes?.trim(),
      customer_code: activity.customer_code,
      customer_name: activity.customer_name
    });
  }, [activity.activity_type, activity.pipeline_stage, activity.notes, activity.customer_code, activity.customer_name]);

  const calculateScore = useCallback(async (activityData: Partial<Activity>) => {
    if (!activityData.activity_type) {
      setScore(0);
      setScoringResult(null);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const result = await SmartCRMService.Intelligence.calculateLeadScore(activityData);
      setScore(result.score);
      setScoringResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate score';
      setError(errorMessage);
      console.error('Lead intelligence calculation failed:', err);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Recalculate when essential activity fields change
  useEffect(() => {
    // Only calculate if we have essential data
    if (!activity.activity_type && !activity.pipeline_stage && !activity.notes?.trim()) {
      setScore(0);
      setScoringResult(null);
      setIsCalculating(false);
      return;
    }

    // Debounce the calculation
    const timeoutId = setTimeout(() => {
      calculateScore(activity);
    }, 800); // Reasonable debounce time
    
    return () => clearTimeout(timeoutId);
  }, [activityKey, calculateScore, activity]);

  return {
    score,
    isCalculating,
    scoringResult,
    error,
    recalculate: calculateScore
  };
};

// ==========================================
// 2. LEAD CREATION RULES HOOK
// ==========================================

/**
 * Hook for managing user's lead creation preferences
 */
export const useLeadCreationRules = (): UseLeadCreationRulesReturn => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: rules,
    isLoading,
    error
  } = useQuery({
    queryKey: ['leadCreationRules', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return SmartCRMService.Preferences.getLeadCreationRules(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<LeadCreationRules>) => {
      if (!user?.id) throw new Error('User not authenticated');
      await SmartCRMService.Preferences.updateLeadCreationRules(user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadCreationRules', user?.id] });
      toast({
        title: 'Preferences Updated',
        description: 'Your lead creation rules have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update preferences',
        variant: 'destructive',
      });
    },
  });

  const resetToDefaults = useCallback(async () => {
    if (!user?.id) return;

    const defaultRules: Partial<LeadCreationRules> = {
      activity_types: SMART_CRM_CONSTANTS.DEFAULT_ACTIVITY_TYPES,
      pipeline_stages: ['Qualified', 'Proposal'],
      keyword_triggers: SMART_CRM_CONSTANTS.DEFAULT_KEYWORDS,
      score_threshold: SMART_CRM_CONSTANTS.DEFAULT_THRESHOLD,
      auto_create_enabled: true
    };

    await updateMutation.mutateAsync(defaultRules);
  }, [user?.id, updateMutation]);

  return {
    rules: rules || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    updateRules: updateMutation.mutateAsync,
    resetToDefaults
  };
};

// ==========================================
// 3. SMART CRM METRICS HOOK
// ==========================================

/**
 * Hook for Smart CRM system metrics and analytics
 */
export const useSmartCRMMetrics = (daysBack: number = 30): UseSmartCRMMetricsReturn => {
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['smartCRMMetrics', daysBack],
    queryFn: () => SmartCRMService.Metrics.getSmartCRMMetrics(daysBack),
    staleTime: SMART_CRM_CONSTANTS.METRICS_REFRESH_INTERVAL,
    refetchInterval: SMART_CRM_CONSTANTS.METRICS_REFRESH_INTERVAL,
  });

  return {
    metrics: metrics || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: refetch
  };
};

// ==========================================
// 4. UNIFIED TIMELINE HOOK
// ==========================================

/**
 * Hook for customer's unified activity-lead timeline
 */
export const useUnifiedTimeline = (customerId: string, limit: number = 50): UseUnifiedTimelineReturn => {
  const [hasMore, setHasMore] = useState(true);
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);

  const {
    data: timelineEvents,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unifiedTimeline', customerId, limit],
    queryFn: () => SmartCRMService.Timeline.getCustomerTimeline(customerId, limit),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update all events when new data comes in
  useEffect(() => {
    if (timelineEvents) {
      setAllEvents(timelineEvents);
      setHasMore(timelineEvents.length >= limit);
    }
  }, [timelineEvents, limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;

    try {
      const newEvents = await SmartCRMService.Timeline.getCustomerTimeline(
        customerId, 
        allEvents.length + limit
      );

      const additionalEvents = newEvents.slice(allEvents.length);
      setAllEvents(prev => [...prev, ...additionalEvents]);
      setHasMore(additionalEvents.length >= limit);
    } catch (error) {
      console.error('Error loading more timeline events:', error);
    }
  }, [customerId, allEvents.length, limit, hasMore]);

  const refresh = useCallback(() => {
    setAllEvents([]);
    setHasMore(true);
    refetch();
  }, [refetch]);

  return {
    timeline: allEvents,
    isLoading,
    error: error instanceof Error ? error.message : null,
    loadMore,
    hasMore,
    refresh
  };
};

// ==========================================
// 5. LEAD CREATION HOOK
// ==========================================

/**
 * Hook for creating leads from activities
 */
export const useLeadCreation = (): UseLeadCreationReturn => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: LeadCreationParams): Promise<LeadCreationResult> => {
      return SmartCRMService.LeadCreation.createLeadFromActivity(params);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['lead_center'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['smartCRMMetrics'] });

        toast({
          title: 'Lead Created Successfully',
          description: result.message,
        });
      } else {
        toast({
          title: 'Lead Creation Failed',
          description: result.message || result.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Lead Creation Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    createLeadFromActivity: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null
  };
};

// ==========================================
// 6. ACTIVITY WITH LEAD INTELLIGENCE HOOK
// ==========================================

/**
 * Hook that combines activity data with lead intelligence
 */
export const useActivityWithIntelligence = (activityId: string) => {
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (error) throw error;
      return data as Activity;
    },
    enabled: !!activityId,
  });

  const { score, scoringResult, isCalculating } = useLeadIntelligence(activity || {});

  return {
    activity,
    score,
    scoringResult,
    isLoading: activityLoading || isCalculating,
    leadPotential: score >= 100 ? 'high' : score >= 60 ? 'medium' : 'low'
  };
};

// ==========================================
// 7. BULK OPERATIONS HOOK
// ==========================================

/**
 * Hook for bulk Smart CRM operations
 */
export const useSmartCRMBulkOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processMultipleActivities = useMutation({
    mutationFn: async (activityIds: string[]) => {
      const { user } = useAuthStore.getState();
      if (!user?.id) throw new Error('User not authenticated');

      const results = await Promise.allSettled(
        activityIds.map(activityId =>
          SmartCRMService.processActivity(activityId, user.id)
        )
      );

      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast({
        title: 'Bulk Processing Complete',
        description: `${successful} activities processed successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      });

      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['smartCRMMetrics'] });
    },
    onError: (error) => {
      toast({
        title: 'Bulk Processing Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    processMultipleActivities: processMultipleActivities.mutateAsync,
    isProcessing: processMultipleActivities.isPending
  };
};

// ==========================================
// 8. SMART CRM NOTIFICATIONS HOOK
// ==========================================

/**
 * Hook for Smart CRM notifications and alerts
 */
export const useSmartCRMNotifications = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);

  // This would typically connect to a real-time notification system
  // For now, we'll simulate with periodic checks
  useEffect(() => {
    if (!user?.id) return;

    const checkNotifications = async () => {
      // In a real implementation, this would query a notifications table
      // or connect to a WebSocket/SSE stream
    };

    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user?.id]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read_at: new Date().toISOString() } : notif
      )
    );
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read_at).length,
    markAsRead
  };
};

// ==========================================
// 9. SCORING BREAKDOWN HOOK
// ==========================================

/**
 * Hook for getting detailed scoring breakdown
 */
export const useScoringBreakdown = (scoringResult: LeadScoringResult | null): ScoringBreakdown[] => {
  return useMemo(() => {
    if (!scoringResult) return [];

    return SmartCRMService.Intelligence.getScoringBreakdown(scoringResult.factors);
  }, [scoringResult]);
};

// ==========================================
// 10. SMART CRM HEALTH HOOK
// ==========================================

/**
 * Hook for monitoring Smart CRM system health
 */
export const useSmartCRMHealth = () => {
  const [healthStatus, setHealthStatus] = useState({
    overall: 'healthy',
    database: 'healthy',
    backgroundJobs: 'healthy',
    lastCheck: new Date().toISOString()
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // This would check system health endpoints
        // For now, we'll assume healthy
        setHealthStatus(prev => ({
          ...prev,
          lastCheck: new Date().toISOString()
        }));
      } catch (error) {
        setHealthStatus(prev => ({
          ...prev,
          overall: 'unhealthy',
          lastCheck: new Date().toISOString()
        }));
      }
    };

    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return healthStatus;
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

// Default export with all hooks
export default {
  useLeadIntelligence,
  useLeadCreationRules,
  useSmartCRMMetrics,
  useUnifiedTimeline,
  useLeadCreation,
  useActivityWithIntelligence,
  useSmartCRMBulkOperations,
  useSmartCRMNotifications,
  useScoringBreakdown,
  useSmartCRMHealth
};