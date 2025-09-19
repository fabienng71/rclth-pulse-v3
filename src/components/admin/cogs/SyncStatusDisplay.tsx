import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { SyncValidationResult } from '@/services/cogsManagementService';

interface SyncStatusDisplayProps {
  issues: SyncValidationResult[];
}

export const SyncStatusDisplay: React.FC<SyncStatusDisplayProps> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>All Synchronized</AlertTitle>
        <AlertDescription>
          All COGS data is properly synchronized between tables.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Synchronization Issues Found</AlertTitle>
        <AlertDescription>
          {issues.length} items have synchronization issues that need attention.
        </AlertDescription>
      </Alert>
      
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {issues.map((issue, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{issue.item_code}</div>
                  <div className="text-sm text-muted-foreground">
                    Master: {issue.master_cogs_unit || 'N/A'} | 
                    Latest: {issue.latest_cogs_unit || 'N/A'}
                    {issue.latest_year && issue.latest_month && (
                      <span> ({issue.latest_year}-{issue.latest_month.toString().padStart(2, '0')})</span>
                    )}
                  </div>
                </div>
                <Badge variant={issue.is_synced ? "default" : "destructive"}>
                  {issue.is_synced ? "Synced" : "Out of Sync"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};