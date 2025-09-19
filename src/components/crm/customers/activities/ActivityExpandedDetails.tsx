
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { User, FileText } from 'lucide-react';
import { CustomerActivity } from './types';
import { formatDate, sanitizeHtml } from './utils';

interface ActivityExpandedDetailsProps {
  activity: CustomerActivity;
}

export const ActivityExpandedDetails: React.FC<ActivityExpandedDetailsProps> = ({ activity }) => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="p-0">
        <div className="bg-muted/30 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Details
                </h4>
                <div className="text-sm space-y-1">
                  <div><strong>Salesperson:</strong> {activity.salesperson_name || '-'}</div>
                  <div><strong>Contact:</strong> {activity.contact_name || '-'}</div>
                  {activity.follow_up_date && (
                    <div><strong>Follow-up:</strong> {formatDate(activity.follow_up_date)}</div>
                  )}
                </div>
              </div>
              
              {(activity.project_id || activity.sample_request_id) && (
                <div>
                  <h4 className="font-medium mb-1">Related Items</h4>
                  <div className="text-sm space-y-1">
                    {activity.project_id && (
                      <div><strong>Project ID:</strong> {activity.project_id}</div>
                    )}
                    {activity.sample_request_id && (
                      <div><strong>Sample Request:</strong> {activity.sample_request_id}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {activity.notes && (
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h4>
                <div 
                  className="text-sm text-muted-foreground bg-background p-3 rounded border prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(activity.notes)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
