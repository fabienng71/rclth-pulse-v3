
import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LeadNotesCardProps {
  notesCount: number;
  showForm: boolean;
  onToggleForm: () => void;
  children: React.ReactNode;
}

export const LeadNotesCard: React.FC<LeadNotesCardProps> = ({
  notesCount,
  showForm,
  onToggleForm,
  children
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes & Timeline ({notesCount})
          </CardTitle>
          <Button
            size="sm"
            onClick={onToggleForm}
            disabled={showForm}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
