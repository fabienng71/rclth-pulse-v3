
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useChecklistTemplates } from './useChecklistTemplates';
import { detectTemplateChanges, syncChecklistWithTemplate, SyncResult } from '@/utils/templateSync';
import { TodoSection } from '@/types/shipmentTodo';
import { toast } from 'sonner';

export const useTemplateSync = (shipmentId?: string, currentData?: TodoSection[], templateId?: string) => {
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const { templates } = useChecklistTemplates();

  const checkForUpdates = useCallback(async () => {
    if (!currentData || !templateId) return null;

    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    const result = detectTemplateChanges(currentData, template.template_data);
    setSyncResult(result);
    return result;
  }, [currentData, templateId, templates]);

  const syncWithTemplate = useCallback(async (): Promise<boolean> => {
    if (!shipmentId || !currentData || !templateId || !syncResult) {
      toast.error('Missing data for sync operation');
      return false;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast.error('Template not found');
      return false;
    }

    try {
      setSyncLoading(true);
      
      const syncedData = syncChecklistWithTemplate(currentData, template.template_data);
      
      // Calculate new completion stats
      const totalTasks = syncedData.reduce((total, section) => total + section.items.length, 0);
      const completedTasks = syncedData.reduce((total, section) => 
        total + section.items.filter(item => item.completed).length, 0
      );
      
      const allCompleted = completedTasks === totalTasks;
      const completionStats = { total: totalTasks, completed: completedTasks };

      const { error } = await supabase
        .from('shipment_todos')
        .update({
          checklist_data: syncedData as any,
          completion_stats: completionStats as any,
          all_tasks_completed: allCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('shipment_id', shipmentId);

      if (error) {
        throw error;
      }

      toast.success('Todo list synchronized with template successfully!');
      setSyncResult(null);
      return true;

    } catch (error) {
      console.error('Error syncing with template:', error);
      toast.error('Failed to sync with template');
      return false;
    } finally {
      setSyncLoading(false);
    }
  }, [shipmentId, currentData, templateId, syncResult, templates]);

  return {
    syncResult,
    syncLoading,
    checkForUpdates,
    syncWithTemplate,
    clearSyncResult: () => setSyncResult(null)
  };
};
