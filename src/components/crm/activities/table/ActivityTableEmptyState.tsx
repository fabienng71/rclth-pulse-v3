
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const ActivityTableEmptyState = () => {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <Calendar className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No activities found</h3>
      <p className="text-muted-foreground mb-4">
        Get started by creating your first activity or adjust your filters.
      </p>
      <Button onClick={() => window.location.href = '/crm/activity/new'}>
        Create Activity
      </Button>
    </Card>
  );
};
