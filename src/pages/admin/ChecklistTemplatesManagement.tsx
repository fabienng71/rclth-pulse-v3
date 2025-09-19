
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { useChecklistTemplates, ChecklistTemplate, CreateTemplateData } from '@/hooks/useChecklistTemplates';
import { TemplateForm } from '@/components/admin/checklist-templates/TemplateForm';
import { TemplatesTable } from '@/components/admin/checklist-templates/TemplatesTable';

const ChecklistTemplatesManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    isCreating,
    isUpdating,
    isDeleting,
    isSettingDefault
  } = useChecklistTemplates();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

  if (!isAdmin) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/admin/control-center')} className="mt-4">
              Back to Control Center
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateTemplate = (data: CreateTemplateData) => {
    createTemplate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      }
    });
  };

  const handleUpdateTemplate = (data: CreateTemplateData) => {
    if (!editingTemplate) return;
    
    updateTemplate({ id: editingTemplate.id, updates: data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
      }
    });
  };

  const openEditDialog = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/admin/control-center')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Control Center
          </Button>
          
          <div className="section-background p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <CheckSquare className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Checklist Templates
                  </h1>
                  <p className="text-muted-foreground text-xl mt-2">
                    Manage and customize checklist templates for shipments and other processes
                  </p>
                </div>
              </div>
              
              <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Templates Overview</CardTitle>
            <CardDescription>
              View and manage all checklist templates in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplatesTable
              templates={templates}
              isLoading={isLoading}
              onEdit={openEditDialog}
              onDelete={deleteTemplate}
              onSetDefault={setDefaultTemplate}
              isDeleting={isDeleting}
              isSettingDefault={isSettingDefault}
            />
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Checklist Template</DialogTitle>
              <DialogDescription>
                Create a new checklist template for shipments and other processes
              </DialogDescription>
            </DialogHeader>
            <TemplateForm 
              onSubmit={handleCreateTemplate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isCreating}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Checklist Template</DialogTitle>
              <DialogDescription>
                Update the checklist template settings and content
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <TemplateForm 
                initialData={{
                  name: editingTemplate.name,
                  description: editingTemplate.description || '',
                  template_data: editingTemplate.template_data,
                  is_default: editingTemplate.is_default
                }}
                onSubmit={handleUpdateTemplate}
                onCancel={closeEditDialog}
                isSubmitting={isUpdating}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ChecklistTemplatesManagement;
