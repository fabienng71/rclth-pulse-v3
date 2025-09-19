
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "react-router-dom";
import { useLeadForm } from "@/hooks/useLeadForm";
import { useToast } from "@/hooks/use-toast";
import { LeadForm } from "@/components/crm/lead-form/LeadForm";
import { useLeadPageDetails } from "@/hooks/useLeadPageDetails";
import { useLeadScreenshotUpload } from "@/hooks/useLeadScreenshotUpload";
import { useLeadPrefill } from "@/hooks/useLeadPrefill";
import { UniversalBackButton, UniversalBreadcrumb } from "@/components/common/navigation";

const CreateLead = () => {
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();

  const {
    form,
    loadingLead,
    profiles,
    profilesLoading,
    profilesError,
    onSubmit,
    isEditing
  } = useLeadForm();

  const uploadMode = location.state?.uploadMode === true;
  const isViewMode = !!params.id && !location.pathname.endsWith('/edit');

  // Using new custom hooks for better logic separation
  useLeadPrefill({ form, isEditing, isViewMode, toast });
  const { handleInstagramScreenshotUpload } = useLeadScreenshotUpload({ form, toast });
  const { pageTitle, pageDescription } = useLeadPageDetails({ isViewMode, isEditing, uploadMode });

  const handleFormSubmit = (values: any) => {
    if (form.getValues('customer_name')) {
      onSubmit(values);
    } else {
      toast({
        title: "Missing Information",
        description: "Please provide a customer name.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (uploadMode) {
      window.scrollTo(0, 0);
      toast({
        title: "Smart Lead Creation",
        description: "Upload a screenshot or business card to automatically extract contact information, or fill out the form manually.",
        variant: "default"
      });
    }
  }, [uploadMode, toast]);

  return (
    <>
      <Navigation />
      <div className="container py-10 max-w-4xl mx-auto px-4 sm:px-6">
        <UniversalBreadcrumb />
        
        <div className="flex items-center gap-4 mb-8">
          <UniversalBackButton />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">{pageDescription}</p>
          </div>
        </div>

        <LeadForm
          form={form}
          loadingLead={loadingLead}
          profiles={profiles}
          profilesLoading={profilesLoading}
          profilesError={profilesError}
          uploadMode={uploadMode}
          isEditing={isEditing}
          isViewMode={isViewMode}
          onSubmit={handleFormSubmit}
          onUploadComplete={handleInstagramScreenshotUpload}
        />
      </div>
    </>
  );
};

export default CreateLead;
