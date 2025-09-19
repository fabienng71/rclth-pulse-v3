
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ActivityFollowUp {
  id: string;
  follow_up_note: string;
  follow_up_date: string;
  priority: 'low' | 'medium' | 'high';
  is_done: boolean;
  created_at: string;
  assigned_to?: string;
  created_by?: string;
}

interface ActivityPipeline {
  id: string;
  activity_date: string;
  activity_type: string;
  customer_name?: string;
  customer_code?: string;
  lead_name?: string;
  lead_id?: string;
  is_lead: boolean;
  contact_name?: string;
  salesperson_name?: string;
  notes?: string;
  follow_up_date?: string;
  pipeline_stage?: string;
  parent_activity_id?: string;
  follow_ups?: ActivityFollowUp[];
}

export const useActivityPipeline = (activityId?: string) => {
  const [activities, setActivities] = useState<ActivityPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityPipeline = async (startActivityId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🚀 Starting optimized pipeline fetch for activity: ${startActivityId}`);
      
      // Try optimized approach first
      try {
        const optimizedResult = await fetchActivityPipelineOptimized(startActivityId);
        if (optimizedResult.success) {
          console.log(`✅ Optimized pipeline fetch succeeded with ${optimizedResult.activities.length} activities`);
          setActivities(optimizedResult.activities);
          return;
        } else {
          console.warn('⚠️ Optimized pipeline fetch failed, falling back to original implementation:', optimizedResult.error);
        }
      } catch (optimizedError) {
        console.warn('⚠️ Optimized pipeline fetch threw error, falling back to original implementation:', optimizedError);
      }

      // Fallback to original implementation for reliability
      console.log('🔄 Using original pipeline fetch implementation as fallback');
      await fetchActivityPipelineOriginal(startActivityId);
      
    } catch (err) {
      console.error('Error fetching activity pipeline:', err);
      setError('Failed to load activity pipeline');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Optimized pipeline fetching using bulk queries instead of N+1 queries
   */
  const fetchActivityPipelineOptimized = async (startActivityId: string): Promise<{
    success: boolean;
    activities: ActivityPipeline[];
    error?: string;
  }> => {
    try {
      console.log('🔍 Starting optimized pipeline traversal...');
      
      // Step 1: Get all activities in bulk (this is more efficient than N+1 queries)
      const { data: allActivities, error: activitiesError } = await supabase
        .from('activities')
        .select('*');
      
      if (activitiesError) {
        return { success: false, activities: [], error: `Failed to fetch activities: ${activitiesError.message}` };
      }
      
      if (!allActivities || allActivities.length === 0) {
        return { success: true, activities: [] };
      }
      
      // Step 2: Build activity lookup map for O(1) access
      const activityMap = new Map<string, ActivityPipeline>();
      allActivities.forEach(activity => {
        activityMap.set(activity.id, activity);
      });
      
      // Verify start activity exists
      if (!activityMap.has(startActivityId)) {
        return { success: false, activities: [], error: `Start activity ${startActivityId} not found` };
      }
      
      // Step 3: Build the complete pipeline chain efficiently
      const visited = new Set<string>();
      const pipelineActivities: ActivityPipeline[] = [];
      
      // Find root activity by traversing up the parent chain
      let currentActivity = activityMap.get(startActivityId)!;
      const pathToRoot: ActivityPipeline[] = [];
      
      while (currentActivity && !visited.has(currentActivity.id)) {
        visited.add(currentActivity.id);
        pathToRoot.unshift(currentActivity); // Add to beginning for correct order
        
        if (currentActivity.parent_activity_id && activityMap.has(currentActivity.parent_activity_id)) {
          currentActivity = activityMap.get(currentActivity.parent_activity_id)!;
        } else {
          break; // Reached root or broken chain
        }
      }
      
      // Add all activities in the path to root
      pipelineActivities.push(...pathToRoot);
      
      // Step 4: Add all descendant activities using iterative approach (no recursion)
      const queue: string[] = [startActivityId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        
        // Find all children of current activity
        const children = allActivities.filter(activity => 
          activity.parent_activity_id === currentId && !visited.has(activity.id)
        );
        
        for (const child of children) {
          if (!visited.has(child.id)) {
            visited.add(child.id);
            pipelineActivities.push(child);
            queue.push(child.id); // Add children to queue for processing
          }
        }
      }
      
      // Step 5: Sort activities by date for consistent ordering
      pipelineActivities.sort((a, b) => 
        new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime()
      );
      
      console.log(`✅ Optimized traversal completed: found ${pipelineActivities.length} activities`);
      
      // Step 6: Fetch follow-ups in bulk (same as original but more efficient)
      await attachFollowUpData(pipelineActivities);
      
      return { success: true, activities: pipelineActivities };
      
    } catch (error) {
      console.error('❌ Error in optimized pipeline fetch:', error);
      return { 
        success: false, 
        activities: [], 
        error: error instanceof Error ? error.message : 'Unknown error in optimized fetch' 
      };
    }
  };

  /**
   * Original implementation kept as fallback for reliability
   */
  const fetchActivityPipelineOriginal = async (startActivityId: string) => {
    // First, get the starting activity
    const { data: startActivity, error: startError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', startActivityId)
      .single();

    if (startError) throw startError;

    // Build the complete pipeline chain
    const pipelineActivities: ActivityPipeline[] = [];
    
    // Trace back to find the root activity
    let currentActivity = startActivity;
    const visited = new Set();
    
    while (currentActivity && !visited.has(currentActivity.id)) {
      visited.add(currentActivity.id);
      pipelineActivities.unshift(currentActivity);
      
      if (currentActivity.parent_activity_id) {
        const { data: parentActivity } = await supabase
          .from('activities')
          .select('*')
          .eq('id', currentActivity.parent_activity_id)
          .single();
        
        currentActivity = parentActivity;
      } else {
        break;
      }
    }

    // Now get all activities that follow from the start activity
    const getFollowUpActivities = async (activityId: string): Promise<ActivityPipeline[]> => {
      const { data: followUps } = await supabase
        .from('activities')
        .select('*')
        .eq('parent_activity_id', activityId)
        .order('activity_date', { ascending: true });

      if (!followUps || followUps.length === 0) return [];

      const allFollowUps: ActivityPipeline[] = [];
      for (const followUp of followUps) {
        if (!visited.has(followUp.id)) {
          visited.add(followUp.id);
          allFollowUps.push(followUp);
          const nestedFollowUps = await getFollowUpActivities(followUp.id);
          allFollowUps.push(...nestedFollowUps);
        }
      }
      return allFollowUps;
    };

    const followUpActivities = await getFollowUpActivities(startActivityId);
    pipelineActivities.push(...followUpActivities);

    // Attach follow-up data
    await attachFollowUpData(pipelineActivities);
    
    setActivities(pipelineActivities);
  };

  /**
   * Shared function to attach follow-up data to activities
   */
  const attachFollowUpData = async (pipelineActivities: ActivityPipeline[]) => {
    // Fetch follow-up notes for all activities in the pipeline
    const activityIds = pipelineActivities.map(activity => activity.id);
    
    if (activityIds.length > 0) {
      const { data: followUpNotes, error: followUpError } = await supabase
        .from('activity_follow_ups')
        .select('*')
        .in('activity_id', activityIds)
        .order('follow_up_date', { ascending: true });

      if (followUpError) {
        console.error('Error fetching follow-up notes:', followUpError);
      } else {
        // Group follow-ups by activity_id with proper type casting
        const followUpsByActivity = followUpNotes?.reduce((acc, followUp) => {
          if (!acc[followUp.activity_id]) {
            acc[followUp.activity_id] = [];
          }
          // Cast the priority to the expected type
          const typedFollowUp: ActivityFollowUp = {
            ...followUp,
            priority: (followUp.priority as 'low' | 'medium' | 'high') || 'medium'
          };
          acc[followUp.activity_id].push(typedFollowUp);
          return acc;
        }, {} as Record<string, ActivityFollowUp[]>) || {};

        // Add follow-ups to their respective activities
        pipelineActivities.forEach(activity => {
          activity.follow_ups = followUpsByActivity[activity.id] || [];
        });
      }
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchActivityPipeline(activityId);
    }
  }, [activityId]);

  return {
    activities,
    loading,
    error,
    refetch: () => activityId && fetchActivityPipeline(activityId)
  };
};
