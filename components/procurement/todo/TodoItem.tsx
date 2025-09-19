
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TodoItem as TodoItemType } from './types';

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (completed: boolean) => void;
  disabled?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ item, onToggle, disabled = false }) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      item.completed ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'
    }`}>
      <Checkbox
        checked={item.completed}
        onCheckedChange={(checked) => onToggle(checked as boolean)}
        disabled={disabled}
        className="mt-0.5"
      />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <label className={`text-sm font-medium cursor-pointer ${
            item.completed ? 'line-through text-muted-foreground' : 'text-gray-900'
          }`}>
            {item.label}
          </label>
          
          {item.priority && (
            <Badge variant={getPriorityColor(item.priority)} className="text-xs">
              {item.priority}
            </Badge>
          )}
        </div>
        
        {item.notes && (
          <p className="text-xs text-muted-foreground">
            {item.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
