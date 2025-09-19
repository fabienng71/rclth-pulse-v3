import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCenter, FoodIngredientsSalesStage } from '@/types/leadCenter';
import { KanbanCard } from './KanbanCard';
import { getSalesStageInfo } from '@/utils/channelMapping';

interface KanbanColumnProps {
  column: {
    id: FoodIngredientsSalesStage | 'closed';
    title: string;
    color: string;
    stages?: FoodIngredientsSalesStage[];
  };
  leads: LeadCenter[];
  onDelete: (id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  leads,
  onDelete,
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  
  // Additional drop zones for closed column
  const { setNodeRef: setWonDropRef } = useDroppable({
    id: 'closed_won',
  });
  
  const { setNodeRef: setLostDropRef } = useDroppable({
    id: 'closed_lost',
  });

  const getStatusColor = (columnId: FoodIngredientsSalesStage | 'closed') => {
    if (columnId === 'closed') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    const stageInfo = getSalesStageInfo(columnId);
    return stageInfo.color.replace('bg-', 'bg-').replace('text-', 'text-') + ' border-gray-200';
  };

  const getTotalValue = () => {
    return leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={`flex-1 min-w-[300px] ${column.color}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {column.title}
          </CardTitle>
          <Badge variant="outline" className={getStatusColor(column.id)}>
            {leads.length}
          </Badge>
        </div>
        {leads.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Total: {formatCurrency(getTotalValue())}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
        >
          {column.id === 'closed' ? (
            // Special layout for closed column with won/lost sections
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div 
                  ref={setWonDropRef}
                  className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 text-center hover:bg-green-100 transition-colors min-h-[40px] flex items-center justify-center"
                >
                  Won ({leads.filter(l => l.status === 'closed_won').length})
                </div>
                <div 
                  ref={setLostDropRef}
                  className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 text-center hover:bg-red-100 transition-colors min-h-[40px] flex items-center justify-center"
                >
                  Lost ({leads.filter(l => l.status === 'closed_lost').length})
                </div>
              </div>
              
              {/* Won leads */}
              <div className="space-y-2">
                {leads.filter(l => l.status === 'closed_won').length > 0 && (
                  <div className="text-xs font-medium text-green-700 mb-1">Won</div>
                )}
                <SortableContext 
                  items={leads.filter(l => l.status === 'closed_won').map(lead => lead.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {leads.filter(l => l.status === 'closed_won').map(lead => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </div>
              
              {/* Lost leads */}
              <div className="space-y-2">
                {leads.filter(l => l.status === 'closed_lost').length > 0 && (
                  <div className="text-xs font-medium text-red-700 mb-1">Lost</div>
                )}
                <SortableContext 
                  items={leads.filter(l => l.status === 'closed_lost').map(lead => lead.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {leads.filter(l => l.status === 'closed_lost').map(lead => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </div>
              
              {leads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No closed leads
                </div>
              )}
            </div>
          ) : (
            // Regular column layout
            <>
              <SortableContext 
                items={leads.map(lead => lead.id)}
                strategy={verticalListSortingStrategy}
              >
                {leads.map(lead => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    onDelete={onDelete}
                  />
                ))}
              </SortableContext>
              {leads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No leads in this stage
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};