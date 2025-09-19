
import React from 'react';
import { LeadNote } from '@/types/leadCenter';
import { LeadNoteItem } from './LeadNoteItem';
import { LeadNotesEmptyState } from './LeadNotesEmptyState';

interface LeadNotesListProps {
  notes: LeadNote[];
  isLoading: boolean;
  onDeleteNote: (noteId: string) => void;
}

export const LeadNotesList: React.FC<LeadNotesListProps> = ({ 
  notes, 
  isLoading, 
  onDeleteNote 
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading notes...
      </div>
    );
  }

  if (notes.length === 0) {
    return <LeadNotesEmptyState />;
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <LeadNoteItem
          key={note.id}
          note={note}
          onDelete={onDeleteNote}
        />
      ))}
    </div>
  );
};
