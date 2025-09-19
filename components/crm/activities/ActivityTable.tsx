import { format } from 'date-fns';
import { Activity } from '@/hooks/useActivitiesData';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getActivityTypeColor } from './utils/activityTypeUtils';
import { getSalespersonColor } from './utils/salespersonUtils';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { SortDirection } from '@/hooks/useSortableTable';

interface ActivityTableProps {
  activities: Activity[];
  onActivityClick: (id: string) => void;
  onDelete?: (id: string) => void;
  sortField?: string;
  sortDirection?: SortDirection;
  onSort?: (field: string) => void;
}

export const ActivityTable = ({ 
  activities, 
  onActivityClick, 
  onDelete,
  sortField,
  sortDirection,
  onSort
}: ActivityTableProps) => {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const isSortable = Boolean(onSort);

  const handleDelete = async (e: React.MouseEvent, activityId: string) => {
    e.stopPropagation(); // Prevent row click event
    
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

      toast.success('Activity deleted successfully');
      if (onDelete) onDelete(activityId);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  // Check if follow-up is due (today or in the past)
  const isFollowUpDue = (date: string | null): boolean => {
    if (!date) return false;
    
    const followUpDate = new Date(date);
    followUpDate.setHours(0, 0, 0, 0); // Reset time part for date comparison
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for date comparison
    
    return followUpDate <= today;
  };

  // Render either a regular TableHead or a SortableTableHeader based on props
  const renderTableHeader = (title: string, field: string) => {
    if (isSortable && sortField && sortDirection) {
      return (
        <SortableTableHeader
          field={field}
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={() => onSort && onSort(field)}
        >
          {title}
        </SortableTableHeader>
      );
    }
    
    return <TableHead>{title}</TableHead>;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {renderTableHeader('Date', 'activity_date')}
          {renderTableHeader('Type', 'activity_type')}
          {renderTableHeader('Entity', 'customer_name')}
          {renderTableHeader('Contact', 'contact_name')}
          {renderTableHeader('Salesperson', 'salesperson_name')}
          {renderTableHeader('Follow-up', 'follow_up_date')}
          {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.length === 0 ? (
          <TableRow>
            <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-muted-foreground">
              No activities found. Create your first activity to get started.
            </TableCell>
          </TableRow>
        ) : (
          activities.map((activity) => (
            <TableRow 
              key={activity.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onActivityClick(activity.id)}
            >
              <TableCell>{activity.activity_date ? format(new Date(activity.activity_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={`${getActivityTypeColor(activity.activity_type)} text-white`}>
                  {activity.activity_type || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                {activity.is_lead ? (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                    {activity.lead_name || 'Unknown Lead'}
                  </Badge>
                ) : (
                  activity.search_name || activity.customer_name || 'N/A'
                )}
              </TableCell>
              <TableCell>{activity.contact_name || 'N/A'}</TableCell>
              <TableCell>
                {activity.salesperson_name ? (
                  <Badge
                    variant="outline"
                    className={`${getSalespersonColor(activity.salesperson_name)} border-0`}
                  >
                    {activity.salesperson_name}
                  </Badge>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                {activity.follow_up_date ? (
                  <div className="flex items-center space-x-2">
                    <span>{format(new Date(activity.follow_up_date), 'MMM dd, yyyy')}</span>
                    {isFollowUpDue(activity.follow_up_date) && (
                      <Badge variant="destructive" className="ml-1">Due</Badge>
                    )}
                  </div>
                ) : (
                  'None'
                )}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(e, activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
