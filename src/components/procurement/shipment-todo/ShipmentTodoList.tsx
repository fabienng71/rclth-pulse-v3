
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Zap } from 'lucide-react';
import { TodoSection, TodoItem } from '@/types/shipmentTodo';

interface ShipmentTodoListProps {
  checklistData: TodoSection[];
  onUpdate: (
    updatedData: TodoSection[], 
    taskId?: string, 
    sectionId?: string, 
    previousStatus?: boolean
  ) => void;
}

const ShipmentTodoList: React.FC<ShipmentTodoListProps> = ({ checklistData, onUpdate }) => {
  
  const handleTaskToggle = (sectionId: string, taskId: string, completed: boolean) => {
    const updatedData = checklistData.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === taskId) {
              return {
                ...item,
                completed,
                completedAt: completed ? new Date().toISOString() : undefined,
                completedBy: completed ? 'current-user' : undefined // We'll get this from auth context
              };
            }
            return item;
          })
        };
      }
      return section;
    });

    // Find the previous status for history tracking
    const previousStatus = checklistData
      .find(s => s.id === sectionId)?.items
      .find(i => i.id === taskId)?.completed;

    onUpdate(updatedData, taskId, sectionId, previousStatus);
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'low':
        return <Zap className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSectionProgress = (section: TodoSection) => {
    const completed = section.items.filter(item => item.completed).length;
    const total = section.items.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full" defaultValue={checklistData.map(s => s.id)}>
        {checklistData.map((section) => {
          const progress = getSectionProgress(section);
          
          return (
            <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{section.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {progress.completed}/{progress.total}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[3rem]">
                      {progress.percentage}%
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        item.completed 
                          ? 'bg-green-50 border-green-200' 
                          : getPriorityColor(item.priority)
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`${section.id}-${item.id}`}
                          checked={item.completed}
                          onCheckedChange={(checked) => 
                            handleTaskToggle(section.id, item.id, checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <label 
                            htmlFor={`${section.id}-${item.id}`}
                            className={`text-sm font-medium cursor-pointer block ${
                              item.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.label}
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            {item.priority && (
                              <div className="flex items-center gap-1">
                                {getPriorityIcon(item.priority)}
                                <span className="text-xs text-muted-foreground capitalize">
                                  {item.priority}
                                </span>
                              </div>
                            )}
                            {item.completed && item.completedAt && (
                              <span className="text-xs text-green-600">
                                ✓ Completed {new Date(item.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ShipmentTodoList;
