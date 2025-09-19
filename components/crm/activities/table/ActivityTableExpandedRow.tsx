
import React from 'react';
import { format } from 'date-fns';
import { Activity } from '@/hooks/useActivitiesData';
import { TableCell, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/stores/authStore';
import { RichTextEditor } from '@/components/crm/rich-text-editor';
import { LinkedSampleDetails } from './LinkedSampleDetails';
import { LinkedProjectDetails } from './LinkedProjectDetails';
import { ActivityFollowUpsSection } from './ActivityFollowUpsSection';
import { User } from 'lucide-react';

interface ActivityTableExpandedRowProps {
  activity: Activity;
}

export const ActivityTableExpandedRow = ({ activity }: ActivityTableExpandedRowProps) => {
  const { isAdmin } = useAuthStore();

  return (
    <TableRow>
      <TableCell colSpan={8} className="p-0 bg-muted/20">
        <div className="p-3 space-y-3">
          {/* Compact Information Grid - 3 columns */}
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {/* Column 1: Contact & Basic Details */}
            <div className="space-y-3">
              {activity.contact_name && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Contact</h4>
                  <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-border/50">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm">{activity.contact_name}</span>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Activity Details</h4>
                <div className="space-y-1 text-xs bg-background rounded-md border border-border/50 p-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{format(new Date(activity.created_at), 'MMM dd, HH:mm')}</span>
                  </div>
                  {activity.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{format(new Date(activity.updated_at), 'MMM dd, HH:mm')}</span>
                    </div>
                  )}
                  {/* Show mobile-hidden information */}
                  <div className="sm:hidden">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{activity.activity_date ? format(new Date(activity.activity_date), 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="md:hidden">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salesperson:</span>
                      <span>{activity.salesperson_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: References & Pipeline Info */}
            <div className="space-y-3">
              {(activity.customer_code || activity.project_id || activity.sample_request_id) && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">References</h4>
                  <div className="space-y-1 text-xs bg-background rounded-md border border-border/50 p-2">
                    {activity.customer_code && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-mono">{activity.customer_code}</span>
                      </div>
                    )}
                    {activity.project_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Project:</span>
                        <span className="font-mono text-xs">{activity.project_id.slice(0, 8)}...</span>
                      </div>
                    )}
                    {activity.sample_request_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sample:</span>
                        <span className="font-mono text-xs">{activity.sample_request_id.slice(0, 8)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show pipeline and follow-up info for smaller screens */}
              <div className="lg:hidden">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pipeline</h4>
                <div className="space-y-1 text-xs bg-background rounded-md border border-border/50 p-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stage:</span>
                    <span>{activity.pipeline_stage || 'Lead'}</span>
                  </div>
                  {activity.follow_up_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Follow-up:</span>
                      <span>{format(new Date(activity.follow_up_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: Quick Actions & Status */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Status</h4>
                <div className="flex gap-1 flex-wrap">
                  {activity.is_done && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      Completed
                    </Badge>
                  )}
                  {activity.follow_up_date && !activity.is_done && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                      Follow-up Due
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section - Full Width */}
          {activity.notes && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</h4>
              <div className="bg-background rounded-md border border-border/50 max-w-full overflow-hidden">
                <div className="p-3">
                  <RichTextEditor 
                    value={activity.notes || '<p></p>'} 
                    onChange={() => {}} 
                    readOnly={true} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Linked Data Sections */}
          {activity.sample_request && (
            <LinkedSampleDetails sampleRequest={activity.sample_request} />
          )}

          {activity.project && (
            <LinkedProjectDetails project={activity.project} />
          )}

          {/* Follow-ups Section */}
          <ActivityFollowUpsSection activityId={activity.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};
