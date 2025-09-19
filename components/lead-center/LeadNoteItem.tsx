
import React from 'react';
import { Lock, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadNote } from '@/types/leadCenter';
import { SafeHtml } from '@/utils/htmlSanitizer';

interface LeadNoteItemProps {
  note: LeadNote;
  onDelete: (noteId: string) => void;
}

export const LeadNoteItem: React.FC<LeadNoteItemProps> = ({ note, onDelete }) => {
  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'call': return 'bg-green-100 text-green-800 border-green-200';
      case 'email': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'follow_up': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={getNoteTypeColor(note.note_type)}>
            {note.note_type.replace('_', ' ')}
          </Badge>
          {note.is_private && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Private
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SafeHtml 
        content={note.note}
        className="text-sm mb-3 prose prose-sm max-w-none"
        fallbackToText={true}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3" />
          <span>
            {note.created_by_user?.name || 'Unknown User'}
          </span>
        </div>
        <span>
          {new Date(note.created_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
