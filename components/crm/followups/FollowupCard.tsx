
import React from 'react';
import { format } from 'date-fns';
import { Calendar, User, Building, FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@/hooks/useActivitiesData';
import { PipelineStageBadge } from '@/components/crm/activities/PipelineStageBadge';
import DOMPurify from 'dompurify';

interface FollowupCardProps {
  activity: Activity;
  onClick: () => void;
  onDelete: () => void;
}

export const FollowupCard: React.FC<FollowupCardProps> = ({
  activity,
  onClick,
  onDelete
}) => {
  const getDateStatus = (followUpDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const followUp = new Date(followUpDate);
    followUp.setHours(0, 0, 0, 0);
    
    if (followUp < today) {
      return { status: 'overdue', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (followUp.getTime() === today.getTime()) {
      return { status: 'today', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'upcoming', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
  };

  const dateStatus = getDateStatus(activity.follow_up_date!);
  const IconComponent = dateStatus.icon;
  const isCompleted = activity.is_done || false;
  const isOverdue = dateStatus.status === 'overdue' && !isCompleted;

  // Apply dimmed styling for completed activities
  const cardClassName = isCompleted 
    ? "cursor-pointer transition-all duration-200 hover:shadow-md bg-muted/30 opacity-75 border-muted" 
    : "cursor-pointer transition-all duration-200 hover:shadow-md";

  // Safely render HTML notes with truncation
  const renderNotes = (notes: string) => {
    if (!notes) return null;
    
    // Sanitize the HTML
    const sanitizedHTML = DOMPurify.sanitize(notes);
    
    // For preview, we'll strip HTML tags to calculate length for truncation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHTML;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Truncate if needed
    const maxLength = 100;
    const shouldTruncate = textContent.length > maxLength;
    
    if (shouldTruncate) {
      // Create truncated version by cutting the sanitized HTML
      const truncatedText = textContent.substring(0, maxLength) + '...';
      return (
        <p 
          className={`text-xs line-clamp-2 ${isCompleted ? 'text-muted-foreground' : 'text-gray-600'}`}
        >
          {truncatedText}
        </p>
      );
    }
    
    return (
      <div 
        className={`text-xs line-clamp-2 ${isCompleted ? 'text-muted-foreground' : 'text-gray-600'} prose prose-sm max-w-none`}
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    );
  };

  return (
    <Card className={cardClassName} onClick={onClick}>
      <CardContent className="p-4 space-y-3">
        {/* Header with date and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-full ${isCompleted ? 'bg-gray-100' : dateStatus.bgColor}`}>
              <IconComponent className={`h-4 w-4 ${isCompleted ? 'text-gray-500' : dateStatus.color}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isCompleted ? 'text-muted-foreground' : dateStatus.color}`}>
                {format(new Date(activity.follow_up_date!), 'MMM dd, yyyy')}
              </p>
              <p className={`text-xs ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {isCompleted ? 'Completed' : dateStatus.status.charAt(0).toUpperCase() + dateStatus.status.slice(1)}
              </p>
            </div>
          </div>
          
          {/* Show completion icon for completed activities */}
          {isCompleted && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          
          {/* Only show overdue badge for non-completed activities */}
          {isOverdue && !isCompleted && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {activity.is_lead ? (
              <>
                <Badge variant="outline" className={`bg-amber-50 text-amber-700 border-amber-200 text-xs ${isCompleted ? 'opacity-60' : ''}`}>
                  Lead
                </Badge>
                <span className={`font-medium text-sm ${isCompleted ? 'text-muted-foreground' : ''}`}>
                  {activity.lead_name || 'Unknown Lead'}
                </span>
              </>
            ) : (
              <>
                <Building className={`h-3 w-3 text-muted-foreground ${isCompleted ? 'opacity-60' : ''}`} />
                <span className={`font-medium text-sm ${isCompleted ? 'text-muted-foreground' : ''}`}>
                  {activity.customer_name || 'N/A'}
                </span>
              </>
            )}
          </div>

          {activity.salesperson_name && (
            <div className="flex items-center gap-2">
              <User className={`h-3 w-3 text-muted-foreground ${isCompleted ? 'opacity-60' : ''}`} />
              <span className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-gray-600'}`}>
                {activity.salesperson_name}
              </span>
            </div>
          )}
        </div>

        {/* Pipeline Stage */}
        <div className="flex justify-start">
          <PipelineStageBadge 
            stage={activity.pipeline_stage || 'Lead'} 
          />
        </div>

        {/* Notes Preview */}
        {activity.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <FileText className={`h-3 w-3 text-muted-foreground ${isCompleted ? 'opacity-60' : ''}`} />
              <span className={`text-xs font-medium ${isCompleted ? 'text-muted-foreground' : 'text-gray-500'}`}>
                Notes
              </span>
            </div>
            {renderNotes(activity.notes)}
          </div>
        )}

        {/* Completion timestamp for completed activities */}
        {isCompleted && activity.completed_at && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Completed: {format(new Date(activity.completed_at), 'MMM dd, yyyy HH:mm')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
