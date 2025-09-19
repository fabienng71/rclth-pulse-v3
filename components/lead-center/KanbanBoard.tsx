import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { LeadCenter, FoodIngredientsSalesStage } from '@/types/leadCenter';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  leads: LeadCenter[];
  isLoading: boolean;
  onStatusUpdate: (id: string, status: FoodIngredientsSalesStage) => void;
  onDelete: (id: string) => void;
}

const columns: { id: FoodIngredientsSalesStage | 'closed'; title: string; color: string; stages?: FoodIngredientsSalesStage[] }[] = [
  { id: 'contacted', title: 'Contacted', color: 'bg-blue-50 border-blue-200' },
  { id: 'meeting_scheduled', title: 'Meeting Scheduled', color: 'bg-indigo-50 border-indigo-200' },
  { id: 'samples_sent', title: 'Samples Sent', color: 'bg-purple-50 border-purple-200' },
  { id: 'samples_followed_up', title: 'Samples Follow-up', color: 'bg-pink-50 border-pink-200' },
  { id: 'negotiating', title: 'Negotiating', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'closed', title: 'Closed', color: 'bg-gray-50 border-gray-200', stages: ['closed_won', 'closed_lost'] },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  isLoading,
  onStatusUpdate,
  onDelete,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalStatusBeforeDrag, setOriginalStatusBeforeDrag] = useState<FoodIngredientsSalesStage | null>(null);
  const [localLeads, setLocalLeads] = useState<LeadCenter[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Update local leads when props change, but only if no pending updates
  React.useEffect(() => {
    if (pendingUpdates.size === 0) {
      // Validate incoming data and clean any stale statuses
      const validStatuses = ['contacted', 'meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating', 'closed_won', 'closed_lost'];
      const cleanedLeads = leads.map(lead => {
        if (!validStatuses.includes(lead.status)) {
          return { ...lead, status: 'contacted' as FoodIngredientsSalesStage };
        }
        return lead;
      });
      
      setLocalLeads(cleanedLeads);
    }
  }, [leads, pendingUpdates]);

  // Effect to sync state when all pending updates are cleared
  React.useEffect(() => {
    if (pendingUpdates.size === 0 && leads.length > 0) {
      setLocalLeads(leads);
    }
  }, [pendingUpdates.size, leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const leadsByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      if (column.id === 'closed') {
        // For the "closed" column, include both closed_won and closed_lost
        acc[column.id] = localLeads.filter(lead => 
          lead.status === 'closed_won' || lead.status === 'closed_lost'
        );
      } else {
        acc[column.id] = localLeads.filter(lead => lead.status === column.id);
      }
      return acc;
    }, {} as Record<string, LeadCenter[]>);
  }, [localLeads]);

  const activeLead = useMemo(() => {
    return localLeads.find(lead => lead.id === activeId);
  }, [localLeads, activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    const dragId = event.active.id as string;
    setActiveId(dragId);
    
    // Store the original status BEFORE any drag operations modify it
    const draggedLead = localLeads.find(lead => lead.id === dragId);
    if (draggedLead) {
      setOriginalStatusBeforeDrag(draggedLead.status);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active lead
    const activeLead = localLeads.find(lead => lead.id === activeId);
    if (!activeLead) return;

    // Determine the new status
    let newStatus: FoodIngredientsSalesStage | null = null;
    
    // Check if dropping on a specific closed sub-zone first
    if (overId === 'closed_won' || overId === 'closed_lost') {
      newStatus = overId as FoodIngredientsSalesStage;
    } else {
      // Check if dropping on a column
      const targetColumn = columns.find(col => col.id === overId);
      if (targetColumn) {
        if (targetColumn.id === 'closed') {
          // For closed column, default to closed_won (can be changed later)
          newStatus = 'closed_won';
        } else {
          newStatus = targetColumn.id as FoodIngredientsSalesStage;
        }
      } else {
        // Dropping on another lead - find the lead's column
        const overLead = localLeads.find(lead => lead.id === overId);
        if (overLead) {
          newStatus = overLead.status;
        }
      }
    }

    if (newStatus && activeLead.status !== newStatus) {
      // Update local state immediately for smooth UI
      setLocalLeads(prev => 
        prev.map(lead => 
          lead.id === activeId ? { ...lead, status: newStatus } : lead
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeLead = localLeads.find(lead => lead.id === activeId);
    if (!activeLead) return;

    // Use the stored original status, not the current lead status (which may have been modified by dragOver)
    const originalStatus = originalStatusBeforeDrag;
    
    // Clear the stored status
    setOriginalStatusBeforeDrag(null);
    
    if (!originalStatus) {
      return;
    }
    
    // Validate the original status
    const validStatuses = ['contacted', 'meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating', 'closed_won', 'closed_lost'];
    if (!validStatuses.includes(originalStatus)) {
      toast({
        title: "Data Error",
        description: `Lead has invalid status "${originalStatus}". Please refresh the page.`,
        variant: "destructive",
      });
      return;
    }

    // Determine the new status
    let newStatus: FoodIngredientsSalesStage | null = null;
    
    // Check if dropping on a specific closed sub-zone first
    if (overId === 'closed_won' || overId === 'closed_lost') {
      newStatus = overId as FoodIngredientsSalesStage;
    } else {
      const targetColumn = columns.find(col => col.id === overId);
      if (targetColumn) {
        if (targetColumn.id === 'closed') {
          // For closed column, default to closed_won (user can change later)
          newStatus = 'closed_won';
        } else {
          newStatus = targetColumn.id as FoodIngredientsSalesStage;
        }
      } else {
        const overLead = localLeads.find(lead => lead.id === overId);
        if (overLead) {
          // Validate the target lead's status before using it
          const validStatuses = ['contacted', 'meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating', 'closed_won', 'closed_lost'];
          if (validStatuses.includes(overLead.status)) {
            newStatus = overLead.status;
          } else {
            newStatus = 'contacted'; // Safe fallback
          }
        }
      }
    }
    
    if (newStatus && originalStatus !== newStatus) {
      // Additional validation
      const validStatuses = ['contacted', 'meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating', 'closed_won', 'closed_lost'];
      if (!validStatuses.includes(newStatus)) {
        return;
      }
      
      // Mark update as pending
      setPendingUpdates(prev => new Set([...prev, activeId]));
      
      try {
        // Call the status update function and wait for it to complete
        await onStatusUpdate(activeId, newStatus);
      } catch (error: any) {
        // Show user-friendly error message
        toast({
          title: "Update Failed",
          description: `Failed to update lead status: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
        
        // Revert local state on error using the stored original status
        setLocalLeads(prev => 
          prev.map(lead => 
            lead.id === activeId ? { ...lead, status: originalStatus } : lead
          )
        );
      } finally {
        // Always clear pending update
        setPendingUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(activeId);
          return newSet;
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6 h-full">
        {columns.map(column => (
          <div key={column.id} className="flex-1">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-4">{column.title}</h3>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            leads={leadsByStatus[column.id]}
            onDelete={onDelete}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeLead && (
            <KanbanCard
              lead={activeLead}
              onDelete={() => {}}
              isDragging
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};