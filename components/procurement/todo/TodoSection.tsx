
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TodoSection as TodoSectionType } from './types';
import TodoItem from './TodoItem';
import { ChevronDown, ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface TodoSectionProps {
  section: TodoSectionType;
  onItemToggle: (itemId: string, completed: boolean) => void;
  onMarkAllComplete: () => void;
  disabled?: boolean;
}

const TodoSection: React.FC<TodoSectionProps> = ({ 
  section, 
  onItemToggle, 
  onMarkAllComplete, 
  disabled = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedItems = section.items.filter(item => item.completed).length;
  const totalItems = section.items.length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const allCompleted = completedItems === totalItems;

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Section Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              {allCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <h3 className="font-semibold text-lg">{section.title}</h3>
            </div>
            
            <div className="text-sm text-muted-foreground">
              ({completedItems}/{totalItems})
            </div>
          </div>
          
          {!allCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllComplete}
              disabled={disabled}
              className="text-xs"
            >
              Mark All Complete
            </Button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>
      
      {/* Section Items */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {section.items.map(item => (
            <TodoItem
              key={item.id}
              item={item}
              onToggle={(completed) => onItemToggle(item.id, completed)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoSection;
