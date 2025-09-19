
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const noteSchema = z.object({
  note: z.string().min(1, 'Note content is required'),
  note_type: z.enum(['general', 'meeting', 'call', 'email', 'follow_up']),
  is_private: z.boolean(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface LeadNoteFormProps {
  onSubmit: (data: NoteFormData) => void;
  onCancel: () => void;
}

export const LeadNoteForm: React.FC<LeadNoteFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      note: '',
      note_type: 'general',
      is_private: false,
    },
  });

  const handleSubmit = (data: NoteFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <h3 className="font-medium mb-4">Add New Note</h3>
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Note Type</Label>
            <Select
              value={form.watch('note_type')}
              onValueChange={(value) => form.setValue('note_type', value as NoteFormData['note_type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Note</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Switch
                checked={form.watch('is_private')}
                onCheckedChange={(checked) => form.setValue('is_private', checked)}
              />
              Private Note
            </Label>
            <p className="text-xs text-muted-foreground">
              Private notes are only visible to you
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note Content *</Label>
          <Textarea
            id="note"
            {...form.register('note')}
            placeholder="Enter your note here..."
            rows={4}
          />
          {form.formState.errors.note && (
            <p className="text-sm text-destructive">
              {form.formState.errors.note.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Adding...' : 'Add Note'}
          </Button>
        </div>
      </form>
    </div>
  );
};
