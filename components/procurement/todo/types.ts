
export interface TodoItem {
  id: string;
  label: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface TodoSection {
  id: string;
  title: string;
  items: TodoItem[];
}

export interface MonthlyTodoList {
  id: string;
  monthYear: string;
  userId: string;
  checklistData: TodoSection[];
  associatedShipments: string[];
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
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
