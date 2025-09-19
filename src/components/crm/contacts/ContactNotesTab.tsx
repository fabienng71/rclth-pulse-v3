
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  FileText, 
  User, 
  Calendar,
  Lock,
  Edit,
  Trash2
} from 'lucide-react';
import { useContactNotes } from '@/hooks/useContactNotes';
import { CreateNoteModal } from './CreateNoteModal';
import { formatDistanceToNow } from 'date-fns';

interface ContactNotesTabProps {
  contactId: string;
}

const noteTypeColors = {
  general: 'bg-gray-100 text-gray-800',
  meeting: 'bg-blue-100 text-blue-800',
  call: 'bg-green-100 text-green-800',
  personal: 'bg-purple-100 text-purple-800',
  business: 'bg-orange-100 text-orange-800',
};

export const ContactNotesTab: React.FC<ContactNotesTabProps> = ({
  contactId
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { notes, loading, deleteNote, refetch } = useContactNotes(contactId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notes</h3>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No notes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add notes to keep track of important information about this contact
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Note
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const colorClass = noteTypeColors[note.note_type as keyof typeof noteTypeColors] || 'bg-gray-100 text-gray-800';

            return (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {note.title && (
                        <h4 className="font-medium">{note.title}</h4>
                      )}
                      <Badge variant="outline" className={`text-xs ${colorClass}`}>
                        {note.note_type.replace('_', ' ')}
                      </Badge>
                      {note.is_private && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>You</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </span>
                      {note.updated_at !== note.created_at && (
                        <span className="text-orange-600">(edited)</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateNoteModal
        contactId={contactId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};
