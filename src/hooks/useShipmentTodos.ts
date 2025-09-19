
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShipmentTodo, TodoSection, TaskHistoryEntry } from '@/types/shipmentTodo';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export const useShipmentTodos = (shipmentId: string | undefined) => {
  const [todo, setTodo] = useState<ShipmentTodo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  const fetchTodo = useCallback(async () => {
    if (!shipmentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('shipment_todos')
        .select(`
          *,
          template:checklist_templates(name, description)
        `)
        .eq('shipment_id', shipmentId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No todo found, this is expected for some shipments
          setTodo(null);
        } else {
          throw fetchError;
        }
      } else {
        setTodo({
          id: data.id,
          shipmentId: data.shipment_id,
          checklistData: data.checklist_data as unknown as TodoSection[],
          completionStats: data.completion_stats as unknown as { total: number; completed: number },
          taskHistory: data.task_history as unknown as TaskHistoryEntry[],
          allTasksCompleted: data.all_tasks_completed,
          completedAt: data.completed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          lastModifiedBy: data.last_modified_by,
          templateId: data.template_id
        });
      }
    } catch (err) {
      console.error('Error fetching shipment todo:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  const updateTodo = useCallback(async (
    updatedChecklistData: TodoSection[],
    taskId?: string,
    sectionId?: string,
    previousStatus?: boolean
  ) => {
    if (!todo || !user) return;

    try {
      // Calculate completion stats
      let totalTasks = 0;
      let completedTasks = 0;

      updatedChecklistData.forEach(section => {
        section.items.forEach(item => {
          totalTasks++;
          if (item.completed) completedTasks++;
        });
      });

      const allCompleted = completedTasks === totalTasks;
      const completionStats = { total: totalTasks, completed: completedTasks };

      // Add to task history if this is a specific task update
      const updatedHistory = [...todo.taskHistory];
      if (taskId && sectionId && previousStatus !== undefined) {
        const historyEntry: TaskHistoryEntry = {
          taskId,
          sectionId,
          completedBy: user.id,
          completedAt: new Date().toISOString(),
          previousStatus,
          action: !previousStatus ? 'completed' : 'unchecked'
        };
        updatedHistory.push(historyEntry);
      }

      const updateData = {
        checklist_data: updatedChecklistData as any, // Cast to any for Json compatibility
        completion_stats: completionStats as any, // Cast to any for Json compatibility
        task_history: updatedHistory as any, // Cast to any for Json compatibility
        all_tasks_completed: allCompleted,
        completed_at: allCompleted && !todo.allTasksCompleted ? new Date().toISOString() : todo.completedAt,
        last_modified_by: user.id
      };

      const { error: updateError } = await supabase
        .from('shipment_todos')
        .update(updateData)
        .eq('id', todo.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setTodo(prev => prev ? {
        ...prev,
        checklistData: updatedChecklistData,
        completionStats,
        taskHistory: updatedHistory,
        allTasksCompleted: allCompleted,
        completedAt: updateData.completed_at,
        lastModifiedBy: user.id
      } : null);

      // Create notification if all tasks completed for the first time
      if (allCompleted && !todo.allTasksCompleted) {
        // We'll implement notification creation separately
        toast.success('All tasks completed! 🎉');
      }

    } catch (err) {
      console.error('Error updating shipment todo:', err);
      toast.error('Failed to update todo');
      throw err;
    }
  }, [todo, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!shipmentId) return;

    const channel = supabase
      .channel(`shipment-todo-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipment_todos',
          filter: `shipment_id=eq.${shipmentId}`
        },
        (payload) => {
          console.log('Real-time todo update:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new;
            setTodo({
              id: data.id,
              shipmentId: data.shipment_id,
              checklistData: data.checklist_data as unknown as TodoSection[],
              completionStats: data.completion_stats as unknown as { total: number; completed: number },
              taskHistory: data.task_history as unknown as TaskHistoryEntry[],
              allTasksCompleted: data.all_tasks_completed,
              completedAt: data.completed_at,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              lastModifiedBy: data.last_modified_by,
              templateId: data.template_id
            });
          } else if (payload.eventType === 'DELETE') {
            setTodo(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId]);

  useEffect(() => {
    fetchTodo();
  }, [fetchTodo]);

  return {
    todo,
    loading,
    error,
    updateTodo,
    refetch: fetchTodo
  };
};
