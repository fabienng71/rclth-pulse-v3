
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TodoProgress as TodoProgressType } from './types';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface TodoProgressProps {
  progress: TodoProgressType;
  className?: string;
}

const TodoProgress: React.FC<TodoProgressProps> = ({ progress, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Overall Progress</h3>
          <Badge variant={progress.completionPercentage === 100 ? "default" : "secondary"}>
            {progress.completedItems} of {progress.totalItems} completed
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{Math.round(progress.completionPercentage)}%</span>
          </div>
          <Progress value={progress.completionPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>{progress.completedItems} completed</span>
          </div>
          <div className="flex items-center gap-1 text-orange-600">
            <Clock className="h-4 w-4" />
            <span>{progress.totalItems - progress.completedItems} remaining</span>
          </div>
        </div>
      </div>

      {/* Section Progress */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Section Progress</h4>
        <div className="space-y-3">
          {progress.sectionProgress.map(section => (
            <div key={section.sectionId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{section.title}</span>
                <span className="text-muted-foreground">
                  {section.completed}/{section.total}
                </span>
              </div>
              <Progress value={section.percentage} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoProgress;
