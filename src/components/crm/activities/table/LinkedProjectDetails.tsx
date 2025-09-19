
import React from 'react';
import { format } from 'date-fns';
import { FolderOpen, Calendar, DollarSign, Target, Building, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  budget: number | null;
  vendor_name: string | null;
  vendor_code: string | null;
  target_value: number | null;
  target_type: string | null;
}

interface LinkedProjectDetailsProps {
  project: Project;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'on hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const LinkedProjectDetails: React.FC<LinkedProjectDetailsProps> = ({ project }) => {
  return (
    <div className="border rounded-lg p-4 bg-green-50/50">
      <div className="flex items-center gap-2 mb-3">
        <FolderOpen className="h-4 w-4 text-green-600" />
        <h5 className="font-medium text-green-900">Linked Project</h5>
        <Badge className={getStatusColor(project.status)}>
          {project.status}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div>
          <h6 className="font-medium text-sm">{project.title}</h6>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Start Date:
              </span>
              <span>{format(new Date(project.start_date), 'MMM dd, yyyy')}</span>
            </div>
            {project.end_date && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  End Date:
                </span>
                <span>{format(new Date(project.end_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {project.budget && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Budget:
                </span>
                <span className="font-medium">
                  {project.budget.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  })}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {project.vendor_name && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Vendor:
                </span>
                <span>{project.vendor_name}</span>
              </div>
            )}
            {project.vendor_code && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendor Code:</span>
                <span className="font-mono text-xs">{project.vendor_code}</span>
              </div>
            )}
            {project.target_value && project.target_type && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Target:
                </span>
                <span>
                  {project.target_value.toLocaleString()} {project.target_type}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
