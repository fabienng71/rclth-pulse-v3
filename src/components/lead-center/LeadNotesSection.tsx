
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LeadNote } from '@/types/leadCenter';
import { useToast } from '@/hooks/use-toast';
import { LeadNoteForm } from './LeadNoteForm';
import { LeadNotesCard } from './LeadNotesCard';
import { LeadNotesList } from './LeadNotesList';

interface LeadNotesSectionProps {
  leadId: string;
}

export const LeadNotesSection: React.FC<LeadNotesSectionProps> = ({ leadId }) => {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lead_notes')
        .select(`
          *,
          created_by_user:profiles!created_by(id, name, email)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotes(data || []);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (noteData: { note: string; note_type: 'general' | 'meeting' | 'call' | 'email' | 'follow_up'; is_private: boolean }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          ...noteData,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note added successfully",
      });

      setShowForm(false);
      fetchNotes();
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });

      fetchNotes();
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  return (
    <LeadNotesCard
      notesCount={notes.length}
      showForm={showForm}
      onToggleForm={() => setShowForm(true)}
    >
      {showForm && (
        <div className="mb-6">
          <LeadNoteForm
            onSubmit={handleAddNote}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <LeadNotesList
        notes={notes}
        isLoading={isLoading}
        onDeleteNote={handleDeleteNote}
      />
    </LeadNotesCard>
  );
};
