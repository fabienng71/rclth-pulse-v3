
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Download, Tag, UserCheck, X } from 'lucide-react';
import { Contact, useContactTags } from '@/hooks/useContactsData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface ContactsBulkActionsProps {
  selectedContacts: Contact[];
  onContactsUpdated: () => void;
  onSelectionClear: () => void;
}

export const ContactsBulkActions: React.FC<ContactsBulkActionsProps> = ({
  selectedContacts,
  onContactsUpdated,
  onSelectionClear
}) => {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { tags, assignTagToContact } = useContactTags();
  const { toast } = useToast();

  const handleBulkDelete = async () => {
    try {
      const contactIds = selectedContacts.map(c => c.id);
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', contactIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedContacts.length} contacts deleted successfully.`,
      });

      onContactsUpdated();
      onSelectionClear();
    } catch (error) {
      console.error('Error deleting contacts:', error);
      toast({
        title: "Error",
        description: "Failed to delete contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkTagAssignment = async () => {
    if (!selectedTag) return;

    try {
      const assignments = selectedContacts.map(contact => ({
        contact_id: contact.id,
        tag_id: selectedTag
      }));

      const { error } = await supabase
        .from('contact_tag_assignments')
        .upsert(assignments);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Tag assigned to ${selectedContacts.length} contacts.`,
      });

      setIsTagDialogOpen(false);
      setSelectedTag('');
      onContactsUpdated();
      onSelectionClear();
    } catch (error) {
      console.error('Error assigning tags:', error);
      toast({
        title: "Error",
        description: "Failed to assign tags. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      const contactIds = selectedContacts.map(c => c.id);
      
      const { error } = await supabase
        .from('contacts')
        .update({ status: selectedStatus })
        .in('id', contactIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Status updated for ${selectedContacts.length} contacts.`,
      });

      setIsStatusDialogOpen(false);
      setSelectedStatus('');
      onContactsUpdated();
      onSelectionClear();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportContacts = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Position', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedContacts.map(contact => 
        [
          contact.first_name || '',
          contact.last_name || '',
          contact.email || '',
          contact.telephone || '',
          contact.account || '',
          contact.position || '',
          contact.status || ''
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    // Add UTF-8 BOM for proper character encoding
    const utf8BOM = '\uFEFF';
    const blob = new Blob([utf8BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `${selectedContacts.length} contacts exported successfully.`,
    });
  };

  if (selectedContacts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {selectedContacts.length} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectionClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tag to Selected Contacts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleBulkTagAssignment} disabled={!selectedTag}>
                    Add Tag
                  </Button>
                  <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserCheck className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Status for Selected Contacts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleBulkStatusUpdate} disabled={!selectedStatus}>
                    Update Status
                  </Button>
                  <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExportContacts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Selected Contacts</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedContacts.length} selected contacts? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                  Delete Contacts
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
