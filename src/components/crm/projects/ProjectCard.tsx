
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, isValid, parseISO } from 'date-fns';
import { Project } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { useVendorAchievement } from '@/hooks/useVendorAchievement';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Archive, ArchiveX, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from "react";

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
}

export const ProjectCard = ({ project, isAdmin }: ProjectCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const startDate = project.start_date ? parseISO(project.start_date) : null;
  const endDate = project.end_date ? parseISO(project.end_date) : null;
  const isExpired = endDate ? endDate < new Date() : false;

  const { totalValue } = useVendorAchievement(
    project.vendor_code,
    startDate || undefined,
    endDate || undefined,
    project.target_type
  );

  const percentage = project.target_value > 0
    ? Math.round((totalValue / project.target_value) * 100)
    : 0;

  const formatDate = (date: Date | null) => {
    if (!date || !isValid(date)) return 'N/A';
    return format(date, 'MMM dd, yyyy');
  };

  const formattedValue = project.target_type === 'Amount'
    ? formatCurrency(totalValue)
    : formatNumber(totalValue);

  const formattedTarget = project.target_type === 'Amount'
    ? formatCurrency(project.target_value)
    : formatNumber(project.target_value);

  const handleStatusToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('project')
        .update({ is_active: checked, forced_active: isExpired && checked })
        .eq('id', project.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Project ${checked ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error updating project status:', err);
      toast.error('Failed to update project status');
    }
  };

  const handleArchiveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('project')
        .update({ archive: !project.archive })
        .eq('id', project.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Project ${!project.archive ? 'archived' : 'unarchived'} successfully`);
    } catch (err) {
      console.error('Error toggling archive:', err);
      toast.error('Failed to update project archive status');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('project')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
    }
  };

  // Determine project status text
  const getStatusText = () => {
    if (!project.is_active) {
      return <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">stopped</span>;
    }
    
    if (percentage >= 100) {
      return <span className="text-xs text-green-600 dark:text-green-400">completed</span>;
    }
    
    if (isExpired && percentage < 100) {
      return <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">failed</span>;
    }
    
    if (percentage === 0) {
      return <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">not started</span>;
    }
    
    return <span className="text-xs text-green-600 dark:text-green-400">running</span>;
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all group"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.status-toggle')) {
          e.stopPropagation();
          return;
        }
        if (isAdmin && (e.target as HTMLElement).closest('.admin-actions')) {
          e.stopPropagation();
          return;
        }
        navigate(`/crm/projects/${project.id}`);
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusText()}
            <div className="status-toggle">
              <Switch
                checked={project.is_active}
                onCheckedChange={handleStatusToggle}
              />
            </div>
            {isAdmin && (
              <div className="admin-actions flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleArchiveToggle}
                  title={project.archive ? "Unarchive" : "Archive"}
                >
                  {project.archive
                    ? <ArchiveX size={18} />
                    : <Archive size={18} />
                  }
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete">
                  <Delete size={18} color="#d32f2f" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">Start Date</p>
              <p className="text-muted-foreground">{formatDate(startDate)}</p>
            </div>
            <div>
              <p className="font-medium">End Date</p>
              <p className="text-muted-foreground">{formatDate(endDate)}</p>
            </div>
            <div>
              <p className="font-medium">Target</p>
              <p className="text-muted-foreground">
                {formattedTarget} {project.target_type}
              </p>
            </div>
            <div>
              <p className="font-medium">Achievement</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {percentage}%
                </span>
                <span className="text-muted-foreground">
                  ({formattedValue})
                </span>
              </div>
            </div>
            <div>
              <p className="font-medium">Activities</p>
              <p className="text-muted-foreground">{project.activities || 0}</p>
            </div>
            <div>
              <p className="font-medium">Vendor</p>
              <p className="text-muted-foreground">{project.vendor_name || project.vendor_code || 'N/A'}</p>
            </div>
            {project.is_active && isExpired && (
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded border">
                  forced active
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
