import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/hooks/useActivitiesData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  User, 
  Building,
  MessageSquare,
  GitBranch
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { TableCell, TableRow } from '@/components/ui/table';
import { getActivityTypeColor } from '../utils/activityTypeUtils';
import { PipelineStageBadge } from '../PipelineStageBadge';
import { ActivityTypeIcon } from './ActivityTypeIcon';
import { SalespersonBadge } from './SalespersonBadge';
import { ActivityActions } from './ActivityActions';

interface ActivityTableRowProps {
  activity: Activity & { pipeline_stage?: string; parent_activity_id?: string };
  isExpanded: boolean;
  onToggleExpansion: (activityId: string, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
}

export const ActivityTableRow = ({ 
  activity, 
  isExpanded, 
  onToggleExpansion, 
  onDelete 
}: ActivityTableRowProps) => {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = async (e: React.MouseEvent, activityId: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      // Invalidate all activity-related queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['activities'] });
      await queryClient.invalidateQueries({ queryKey: ['followups'] });
      await queryClient.invalidateQueries({ queryKey: ['customerActivities'] });
      await queryClient.invalidateQueries({ queryKey: ['contact-activities'] });

      toast.success('Activity deleted successfully');
      if (onDelete) onDelete(activityId);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const handleEdit = (e: React.MouseEvent, activityId: string) => {
    e.stopPropagation();
    navigate(`/crm/activity/${activityId}`);
  };

  const handleViewPipeline = (e: React.MouseEvent, activityId: string) => {
    e.stopPropagation();
    navigate(`/crm/activities/pipeline/${activityId}`);
  };

  const isFollowUpDue = (date: string | null): boolean => {
    if (!date) return false;
    const followUpDate = new Date(date);
    followUpDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return followUpDate <= today;
  };

  const hasFollowUp = activity.follow_up_date;
  const isOverdue = isFollowUpDue(activity.follow_up_date) && !activity.is_done;
  const isCompleted = activity.is_done || false;

  // Apply background colors based on pipeline stage
  const getRowClassName = () => {
    const baseClasses = "hover:bg-muted/40 transition-all duration-200 group border-b border-border/30";
    
    if (activity.pipeline_stage === 'Closed Won') {
      return `${baseClasses} bg-green-50 hover:bg-green-100`;
    } else if (activity.pipeline_stage === 'Closed Lost') {
      return `${baseClasses} bg-red-50 hover:bg-red-100`;
    } else if (activity.is_done) {
      return `${baseClasses} bg-muted/20 hover:bg-muted/40`;
    }
    
    return `${baseClasses} even:bg-muted/5`;
  };

  return (
    <TableRow className={getRowClassName()}>
      {/* Expand Button */}
      <TableCell className="w-[32px] px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => onToggleExpansion(activity.id, e)}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </TableCell>
      
      {/* Activity Type */}
      <TableCell className="w-[120px] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Badge 
            variant="secondary" 
            className={`${getActivityTypeColor(activity.activity_type)} border-0 px-2 py-1 text-xs`}
          >
            <ActivityTypeIcon type={activity.activity_type} />
          </Badge>
          {activity.parent_activity_id && (
            <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </TableCell>
      
      {/* Entity (Customer/Lead) */}
      <TableCell className="flex-1 min-w-[200px] px-3 py-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {activity.is_lead ? (
            <>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs flex-shrink-0">
                Lead
              </Badge>
              <span className="font-medium truncate text-sm">
                {activity.lead_name || 'Unknown Lead'}
              </span>
            </>
          ) : (
            <>
              <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate text-sm">
                {activity.search_name || activity.customer_name || 'N/A'}
              </span>
            </>
          )}
        </div>
      </TableCell>
      
      {/* Date - Hidden on mobile */}
      <TableCell className="w-[120px] px-3 py-2 hidden sm:table-cell">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm">
            {activity.activity_date ? format(new Date(activity.activity_date), 'MMM dd') : 'N/A'}
          </span>
        </div>
      </TableCell>
      
      {/* Salesperson - Hidden on tablets */}
      <TableCell className="w-[140px] px-3 py-2 hidden md:table-cell">
        <SalespersonBadge name={activity.salesperson_name} />
      </TableCell>

      {/* Pipeline Stage - Hidden on smaller screens */}
      <TableCell className="w-[130px] px-3 py-2 hidden lg:table-cell">
        <PipelineStageBadge stage={activity.pipeline_stage || 'Lead'} />
      </TableCell>
      
      {/* Follow-up - Hidden on smaller screens */}
      <TableCell className="w-[130px] px-3 py-2 hidden lg:table-cell">
        {hasFollowUp ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">
              {format(new Date(activity.follow_up_date!), 'MMM dd')}
            </span>
            {isOverdue && !isCompleted && (
              <Badge variant="destructive" className="text-xs flex-shrink-0">
                Overdue
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        )}
      </TableCell>
      
      {/* Actions */}
      <TableCell className="w-[100px] px-2 py-2">
        <ActivityActions
          isAdmin={isAdmin}
          onViewPipeline={handleViewPipeline}
          onEdit={handleEdit}
          onDelete={onDelete ? (e, id) => handleDelete(e, id) : undefined}
          activityId={activity.id}
        />
      </TableCell>
    </TableRow>
  );
};
