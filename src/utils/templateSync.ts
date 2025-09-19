
import { TodoSection } from '@/types/shipmentTodo';

export interface SyncResult {
  needsSync: boolean;
  changes: {
    newTasks: Array<{ sectionId: string; taskId: string; label: string }>;
    modifiedTasks: Array<{ sectionId: string; taskId: string; oldLabel: string; newLabel: string }>;
    removedTasks: Array<{ sectionId: string; taskId: string; label: string }>;
  };
}

export const detectTemplateChanges = (
  currentData: TodoSection[],
  templateData: TodoSection[]
): SyncResult => {
  const changes = {
    newTasks: [] as Array<{ sectionId: string; taskId: string; label: string }>,
    modifiedTasks: [] as Array<{ sectionId: string; taskId: string; oldLabel: string; newLabel: string }>,
    removedTasks: [] as Array<{ sectionId: string; taskId: string; label: string }>
  };

  // Create maps for easier lookup
  const currentTaskMap = new Map<string, { sectionId: string; task: any }>();
  const templateTaskMap = new Map<string, { sectionId: string; task: any }>();

  // Build current task map
  currentData.forEach(section => {
    section.items.forEach(task => {
      currentTaskMap.set(task.id, { sectionId: section.id, task });
    });
  });

  // Build template task map
  templateData.forEach(section => {
    section.items.forEach(task => {
      templateTaskMap.set(task.id, { sectionId: section.id, task });
    });
  });

  // Find new tasks (in template but not in current)
  templateTaskMap.forEach((templateItem, taskId) => {
    if (!currentTaskMap.has(taskId)) {
      changes.newTasks.push({
        sectionId: templateItem.sectionId,
        taskId,
        label: templateItem.task.label
      });
    }
  });

  // Find modified tasks (same ID but different label)
  currentTaskMap.forEach((currentItem, taskId) => {
    const templateItem = templateTaskMap.get(taskId);
    if (templateItem && currentItem.task.label !== templateItem.task.label) {
      changes.modifiedTasks.push({
        sectionId: currentItem.sectionId,
        taskId,
        oldLabel: currentItem.task.label,
        newLabel: templateItem.task.label
      });
    }
  });

  // Find removed tasks (in current but not in template)
  currentTaskMap.forEach((currentItem, taskId) => {
    if (!templateTaskMap.has(taskId)) {
      changes.removedTasks.push({
        sectionId: currentItem.sectionId,
        taskId,
        label: currentItem.task.label
      });
    }
  });

  const needsSync = changes.newTasks.length > 0 || 
                   changes.modifiedTasks.length > 0 || 
                   changes.removedTasks.length > 0;

  return { needsSync, changes };
};

export const syncChecklistWithTemplate = (
  currentData: TodoSection[],
  templateData: TodoSection[]
): TodoSection[] => {
  // Create a map of current tasks with their completion status
  const completionMap = new Map<string, boolean>();
  currentData.forEach(section => {
    section.items.forEach(task => {
      completionMap.set(task.id, task.completed);
    });
  });

  // Create new checklist based on template but preserve completion status
  return templateData.map(templateSection => {
    // Find if this section exists in current data
    const currentSection = currentData.find(s => s.id === templateSection.id);
    
    return {
      ...templateSection,
      items: templateSection.items.map(templateTask => ({
        ...templateTask,
        // Preserve completion status if task existed before
        completed: completionMap.get(templateTask.id) ?? false,
        // Preserve completion metadata if it existed
        completedAt: completionMap.has(templateTask.id) && completionMap.get(templateTask.id) 
          ? currentSection?.items.find(item => item.id === templateTask.id)?.completedAt
          : undefined,
        completedBy: completionMap.has(templateTask.id) && completionMap.get(templateTask.id)
          ? currentSection?.items.find(item => item.id === templateTask.id)?.completedBy
          : undefined
      }))
    };
  });
};
