import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { useProjectDetails } from '@/hooks/useProjectDetails';
import { useProjectActivities } from '@/hooks/useProjectActivities';
import { useVendorAchievement } from '@/hooks/useVendorAchievement';
import { ProjectActivitiesTable } from '@/components/crm/projects/ProjectActivitiesTable';
import { format, isValid, parseISO } from 'date-fns';
import { formatNumber, formatCurrency } from '@/lib/utils';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, isLoading, error } = useProjectDetails(id);
  
  // Fetch all project activities without limit
  const { 
    activities, 
    loading: activitiesLoading, 
    refetch: refetchActivities 
  } = useProjectActivities({ 
    projectId: id || ''
  });
  
  const startDate = project?.start_date ? parseISO(project.start_date) : null;
  const endDate = project?.end_date ? parseISO(project.end_date) : null;
  const isExpired = endDate ? endDate < new Date() : false;
  
  const { totalValue } = useVendorAchievement(
    project?.vendor_code,
    startDate || undefined,
    endDate || undefined,
    project?.target_type
  );
  
  const percentage = project?.target_value && project.target_value > 0
    ? Math.round((totalValue / project.target_value) * 100)
    : 0;
  
  let statusColor = 'bg-gray-100';
  if (percentage >= 100) {
    statusColor = 'bg-green-100 text-green-800';
  } else if (percentage >= 50) {
    statusColor = 'bg-amber-100 text-amber-800';
  } else if (percentage > 0) {
    statusColor = 'bg-red-100 text-red-800';
  }
  
  const formatDate = (date: Date | null) => {
    if (!date || !isValid(date)) return 'N/A';
    return format(date, 'MMM dd, yyyy');
  };
  
  const formattedValue = project?.target_type === 'Amount' && totalValue !== undefined
    ? formatCurrency(totalValue)
    : totalValue !== undefined ? formatNumber(totalValue) : 'N/A';
  
  const formattedTarget = project?.target_type === 'Amount' && project?.target_value
    ? formatCurrency(project.target_value)
    : project?.target_value ? formatNumber(project.target_value) : 'N/A';

  // Convert ProjectActivity to Activity format for the table
  const convertedActivities = activities?.map(activity => ({
    ...activity,
    sample_request_id: null as string | null, // Add the required field
  })) || [];

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-muted-foreground">Loading project details...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Navigation />
        <main className="container py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/crm/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h2 className="text-lg font-medium mb-2">Project not found</h2>
                <p className="text-muted-foreground mb-4">
                  The project you are looking for does not exist or has been removed.
                </p>
                <Button onClick={() => navigate('/crm/projects')}>
                  Return to Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/crm/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">{project.title}</h1>
            {project.is_active ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
            )}
            {isExpired && project.is_active && project.forced_active && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                [forced]
              </Badge>
            )}
          </div>
          <Button onClick={() => navigate(`/crm/projects/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{project.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">Start Date</h3>
                    <p>{formatDate(startDate)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">End Date</h3>
                    <p>{formatDate(endDate)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Vendor</h3>
                    <p>{project.vendor_name || project.vendor_code || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Activities</h3>
                    <p>{project.activities || '0'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target & Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm">Target Type</h3>
                  <p>{project.target_type || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Target Value</h3>
                  <p className="text-lg font-medium">{formattedTarget}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Current Achievement</h3>
                  <p className="text-lg font-medium">{formattedValue}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Progress</h3>
                  <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                    <div 
                      className={`h-full rounded-full ${percentage >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`px-2 py-0.5 rounded text-sm font-medium ${statusColor}`}>
                      {percentage}%
                    </span>
                    {isExpired ? (
                      percentage >= 100 ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-500">Success</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-500">Failed</Badge>
                      )
                    ) : (
                      percentage === 0 ? (
                        <Badge variant="secondary">Not Started</Badge>
                      ) : percentage < 100 ? (
                        <Badge variant="destructive">In Progress</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-500">Completed</Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Activities Section */}
        <ProjectActivitiesTable
          activities={convertedActivities}
          loading={activitiesLoading}
          projectId={id || ''}
          onRefresh={refetchActivities}
        />
      </main>
    </>
  );
};

export default ProjectDetails;
