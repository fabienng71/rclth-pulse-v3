
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TodoSection } from '@/types/shipmentTodo';

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  template_data: TodoSection[];
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  template_data: TodoSection[];
  is_default?: boolean;
}

export const useChecklistTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: ['checklistTemplates'],
    queryFn: async () => {
      console.log('Fetching checklist templates');
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching checklist templates:', error);
        throw new Error('Failed to fetch checklist templates');
      }

      console.log(`Fetched ${data?.length || 0} templates`);
      // Type assertion to handle Json vs TodoSection[] mismatch
      return (data || []).map(template => ({
        ...template,
        template_data: template.template_data as unknown as TodoSection[]
      })) as ChecklistTemplate[];
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: CreateTemplateData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('checklist_templates')
        .insert([{
          ...templateData,
          template_data: templateData.template_data as any, // Cast to Json
          created_by: userData.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates'] });
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateTemplateData> }) => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .update({
          ...updates,
          template_data: updates.template_data ? updates.template_data as any : undefined // Cast to Json
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates'] });
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    }
  });

  const setDefaultTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, unset all other templates as default
      await supabase
        .from('checklist_templates')
        .update({ is_default: false })
        .neq('id', id);

      // Then set the selected template as default
      const { data, error } = await supabase
        .from('checklist_templates')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates'] });
      toast({
        title: "Success",
        description: "Default template updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set default template",
        variant: "destructive",
      });
    }
  });

  return {
    templates,
    isLoading,
    error,
    refetch,
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    setDefaultTemplate: setDefaultTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
    isSettingDefault: setDefaultTemplateMutation.isPending,
  };
};
