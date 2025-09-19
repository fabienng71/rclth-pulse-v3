import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { LeadCenterForm } from '@/components/lead-center/LeadCenterForm';
import { useLeadManagement } from '@/hooks/useLeadManagement';

const LeadCenterEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { lead, isLoading } = useLeadManagement(id!);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="animate-pulse">Loading lead details...</div>
        </div>
      </>
    );
  }

  if (!lead) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Lead Not Found</h2>
            <p className="text-muted-foreground mb-4">The lead you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/crm/lead-center')}>
              Back to Lead Center
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/crm/lead-center/${id}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Edit Lead</h1>
            <p className="text-muted-foreground">
              Update {lead.lead_title}
            </p>
          </div>
        </div>

        <LeadCenterForm leadId={id} initialData={lead} />
      </div>
    </>
  );
};

export default LeadCenterEdit;