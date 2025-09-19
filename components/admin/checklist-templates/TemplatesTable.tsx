
import React from 'react';
import { Edit, Trash2, Star, StarOff, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChecklistTemplate } from '@/hooks/useChecklistTemplates';

interface TemplatesTableProps {
  templates: ChecklistTemplate[];
  isLoading: boolean;
  onEdit: (template: ChecklistTemplate) => void;
  onDelete: (templateId: string) => void;
  onSetDefault: (templateId: string) => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
}

export const TemplatesTable: React.FC<TemplatesTableProps> = ({
  templates,
  isLoading,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No templates found</h3>
        <p className="text-muted-foreground">
          Get started by creating your first checklist template.
        </p>
      </div>
    );
  }

  const getTotalTasks = (template: ChecklistTemplate) => {
    return template.template_data.reduce((total, section) => total + section.items.length, 0);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Sections</TableHead>
            <TableHead>Total Tasks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {template.name}
                  {template.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{template.description || '-'}</TableCell>
              <TableCell>{template.template_data.length}</TableCell>
              <TableCell>{getTotalTasks(template)}</TableCell>
              <TableCell>
                <Badge variant={template.is_default ? 'default' : 'secondary'}>
                  {template.is_default ? 'Active' : 'Available'}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(template.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefault(template.id)}
                    disabled={template.is_default || isSettingDefault}
                    title={template.is_default ? "Already default" : "Set as default"}
                  >
                    {template.is_default ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={isDeleting || template.is_default}
                        title={template.is_default ? "Cannot delete default template" : "Delete template"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{template.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(template.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
