
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const LeadNotesEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No notes yet. Add the first note to start tracking this lead's progress.</p>
    </div>
  );
};
