
import React, { useState } from 'react';
import { Lead } from '@/hooks/useOptimizedLeadsData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Trash2, Users, Download, Tag } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LeadsBulkActionsProps {
  selectedLeads: Lead[];
  onLeadsUpdated: () => void;
  onSelectionClear: () => void;
}

export const LeadsBulkActions = ({
  selectedLeads,
  onLeadsUpdated,
  onSelectionClear
}: LeadsBulkActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const leadIds = selectedLeads.map(lead => lead.id);
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', leadIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully deleted ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''}`,
      });

      onLeadsUpdated();
      onSelectionClear();
    } catch (error) {
      console.error('Error deleting leads:', error);
      toast({
        title: "Error",
        description: "Failed to delete leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Customer Name', 'Contact Name', 'Email', 'Phone', 'Status', 'Salesperson', 'Industry', 'Website'];
    const csvContent = [
      headers.join(','),
      ...selectedLeads.map(lead => [
        `"${lead.customer_name || ''}"`,
        `"${lead.contact_name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.status || ''}"`,
        `"${lead.full_name || ''}"`,
        `"${lead.industry || ''}"`,
        `"${lead.website || ''}"`
      ].join(','))
    ].join('\n');

    // Download the file with UTF-8 BOM for proper character encoding
    const utf8BOM = '\uFEFF';
    const blob = new Blob([utf8BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Exported ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} to CSV`,
    });
  };

  if (selectedLeads.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Card className="p-4 shadow-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
              </span>
              <Badge variant="secondary">{selectedLeads.length}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectionClear}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Leads</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
