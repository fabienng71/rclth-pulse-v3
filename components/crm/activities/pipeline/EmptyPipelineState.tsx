
import React from 'react';
import { GitBranch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const EmptyPipelineState: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12 text-muted-foreground">
          <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Pipeline Found</h3>
          <p>This activity is not part of any pipeline chain.</p>
        </div>
      </CardContent>
    </Card>
  );
};
