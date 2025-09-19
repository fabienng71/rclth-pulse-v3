
import React from 'react';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityPipelineHeaderProps {
  onBack: () => void;
  entityType: string;
  entityName?: string;
}

export const ActivityPipelineHeader: React.FC<ActivityPipelineHeaderProps> = ({
  onBack,
  entityType,
  entityName
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Activities
      </Button>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="h-6 w-6" />
          Activity Pipeline
        </h1>
        <p className="text-muted-foreground">
          {entityType}: {entityName}
        </p>
      </div>
    </div>
  );
};
