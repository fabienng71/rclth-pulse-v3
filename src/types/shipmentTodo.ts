
import { z } from "zod";

export interface TodoItem {
  id: string;
  label: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface TodoSection {
  id: string;
  title: string;
  items: TodoItem[];
}

export interface TaskHistoryEntry {
  taskId: string;
  sectionId: string;
  completedBy: string;
  completedAt: string;
  previousStatus: boolean;
  action: 'completed' | 'unchecked';
}

export interface ShipmentTodo {
  id: string;
  shipmentId: string;
  checklistData: TodoSection[];
  completionStats: {
    total: number;
    completed: number;
  };
  taskHistory: TaskHistoryEntry[];
  allTasksCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  templateId?: string; // Added to reference which template was used
}

export interface TodoProgress {
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  sectionProgress: Array<{
    sectionId: string;
    title: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
}
