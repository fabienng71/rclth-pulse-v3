
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NotesSectionProps {
  notes: string;
  isSubmitting: boolean;
  onNotesChange: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  isSubmitting,
  onNotesChange
}) => {
  return (
    <>
      <Label htmlFor="notes">Notes (Optional)</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add any additional notes about this sample request"
        className="mt-1 h-32"
        disabled={isSubmitting}
      />
    </>
  );
};

export default NotesSection;
