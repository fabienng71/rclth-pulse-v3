
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useContactNotes } from '@/hooks/useContactNotes';

interface CreateNoteModalProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const noteTypes = [
  { value: 'general', label: 'General' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
];

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  contactId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    note_type: 'general',
    title: '',
    content: '',
    is_private: false,
  });
  const [loading, setLoading] = useState(false);
  
  const { createNote } = useContactNotes(contactId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setLoading(true);
    try {
      await createNote({
        contact_id: contactId,
        note_type: formData.note_type,
        title: formData.title || undefined,
        content: formData.content,
        is_private: formData.is_private,
      });
      onSuccess();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      note_type: 'general',
      title: '',
      content: '',
      is_private: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="note_type">Note Type</Label>
            <Select
              value={formData.note_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, note_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Note title"
            />
          </div>

          <div>
            <Label htmlFor="content">Note Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note here..."
              rows={6}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_private"
              checked={formData.is_private}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_private: !!checked }))}
            />
            <Label htmlFor="is_private" className="text-sm">
              Private note (only visible to you)
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Note'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
