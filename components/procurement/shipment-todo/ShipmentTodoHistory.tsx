
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Check, X } from 'lucide-react';
import { TaskHistoryEntry } from '@/types/shipmentTodo';

interface ShipmentTodoHistoryProps {
  taskHistory: TaskHistoryEntry[];
}

const ShipmentTodoHistory: React.FC<ShipmentTodoHistoryProps> = ({ taskHistory }) => {
  if (!taskHistory || taskHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Task History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No task history yet
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by most recent first
  const sortedHistory = [...taskHistory].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Task History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {sortedHistory.map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="mt-1">
                  {entry.action === 'completed' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={entry.action === 'completed' ? 'default' : 'destructive'} className="text-xs">
                      {entry.action === 'completed' ? 'Completed' : 'Unchecked'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.completedAt).toLocaleDateString()} at{' '}
                      {new Date(entry.completedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="text-sm">
                    Task: <span className="font-medium">{entry.taskId}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Section: {entry.sectionId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ShipmentTodoHistory;
