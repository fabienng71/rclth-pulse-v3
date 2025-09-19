
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomerActivity } from './types';
import { formatDate, getStatusColor, getPipelineStageColor } from './utils';

interface ActivityTableRowProps {
  activity: CustomerActivity;
  isExpanded: boolean;
  onToggle: (activityId: string) => void;
}

export const ActivityTableRow: React.FC<ActivityTableRowProps> = ({
  activity,
  isExpanded,
  onToggle
}) => {
  return (
    <TableRow>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(activity.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
      <TableCell>{formatDate(activity.activity_date)}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {activity.activity_type || 'General'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(activity.status)}>
          {activity.status || 'Unknown'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getPipelineStageColor(activity.pipeline_stage)}>
          {activity.pipeline_stage || 'Lead'}
        </Badge>
      </TableCell>
      <TableCell>{activity.contact_name || '-'}</TableCell>
    </TableRow>
  );
};
