import React from 'react';
import { Calendar, FileText, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LeaveRequestsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateRequest?: () => void;
  showCreateButton?: boolean;
  title?: string;
  description?: string;
}

export const LeaveRequestsEmptyState: React.FC<LeaveRequestsEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
  onCreateRequest,
  showCreateButton = true,
  title,
  description,
}) => {
  if (hasFilters) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No requests match your filters</h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Try adjusting your search criteria or clearing the filters to see more results.
          </p>
          <Button onClick={onClearFilters} variant="outline">
            Clear all filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold">
          {title || 'No leave requests found'}
        </h3>
        
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description || 
            'There are no leave requests to display. Start by creating your first leave request.'}
        </p>

        {showCreateButton && onCreateRequest && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onCreateRequest} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Leave Request
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Guidelines
            </Button>
          </div>
        )}

        {!showCreateButton && (
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Check if you have the necessary permissions</p>
            <p>• Verify your search criteria</p>
            <p>• Contact your administrator if issues persist</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};