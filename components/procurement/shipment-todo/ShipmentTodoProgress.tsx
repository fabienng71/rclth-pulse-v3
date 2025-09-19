
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock } from 'lucide-react';

interface ShipmentTodoProgressProps {
  completionStats: {
    total: number;
    completed: number;
  };
  allCompleted: boolean;
}

const ShipmentTodoProgress: React.FC<ShipmentTodoProgressProps> = ({ 
  completionStats, 
  allCompleted 
}) => {
  const percentage = completionStats.total > 0 
    ? Math.round((completionStats.completed / completionStats.total) * 100) 
    : 0;

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {allCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Clock className="h-5 w-5 text-blue-600" />
          )}
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">
            {completionStats.completed}/{completionStats.total}
          </div>
          <div className="text-sm text-muted-foreground">
            Tasks Completed
          </div>
        </div>
        
        <Progress 
          value={percentage} 
          className="h-3"
        />
        
        <div className="text-center">
          <span className={`text-2xl font-bold ${
            allCompleted ? 'text-green-600' : 'text-blue-600'
          }`}>
            {percentage}%
          </span>
          <div className="text-xs text-muted-foreground">
            {allCompleted ? 'Complete!' : 'In Progress'}
          </div>
        </div>
        
        {allCompleted && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <div className="text-sm font-medium text-green-800">
              All tasks completed!
            </div>
            <div className="text-xs text-green-600">
              Ready for next phase
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentTodoProgress;
