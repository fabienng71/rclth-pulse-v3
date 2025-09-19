
import React from 'react';
import { Form } from "@/components/ui/form";
import { BasicInfoFields } from "./BasicInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { SocialMediaFields } from "./SocialMediaFields";
import { NotesField } from "./NotesField";
import { SalespersonField } from "./SalespersonField";
import { StatusField } from "./StatusField";
import { CustomerTypeField } from "./CustomerTypeField";
import { LeadUploadSection } from "./LeadUploadSection";
import { LeadFormActions } from "./LeadFormActions";
import { Skeleton } from "@/components/ui/skeleton";
import { UseFormReturn } from 'react-hook-form';
import { LeadFormValues } from '@/hooks/useLeadForm';
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
}

interface LeadFormProps {
  form: UseFormReturn<LeadFormValues>;
  loadingLead: boolean;
  profiles: Profile[];
  profilesLoading: boolean;
  profilesError: any;
  uploadMode?: boolean;
  isEditing?: boolean;
  isViewMode?: boolean;
  onSubmit: (values: LeadFormValues) => void;
  onUploadComplete?: (fileUrl: string) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  form,
  loadingLead,
  profiles,
  profilesLoading,
  profilesError,
  uploadMode = false,
  isEditing = false,
  isViewMode = false,
  onSubmit,
  onUploadComplete
}) => {
  // Calculate form completion percentage
  const watchedValues = form.watch();
  const totalFields = 8; // customer_name, contact_name, email, phone, status, salesperson_code, customer_type_code, notes
  const completedFields = [
    watchedValues.customer_name,
    watchedValues.contact_name,
    watchedValues.email,
    watchedValues.phone,
    watchedValues.status,
    watchedValues.salesperson_code,
    watchedValues.customer_type_code,
    watchedValues.notes
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedFields / totalFields) * 100);

  if (loadingLead) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator for new leads */}
      {!isEditing && !isViewMode && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form Completion</span>
            <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {progressPercentage === 100 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Ready to submit!
            </div>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {uploadMode && (
            <LeadUploadSection 
              form={form}
              uploadMode={uploadMode}
              onUploadComplete={onUploadComplete || (() => {})} 
            />
          )}

          <div className="space-y-8">
            <BasicInfoFields control={form.control} disabled={isViewMode} />
            
            <ContactInfoFields control={form.control} disabled={isViewMode} />
            
            <SocialMediaFields control={form.control} disabled={isViewMode} />
            
            <div className="grid gap-8 lg:grid-cols-3">
              <CustomerTypeField control={form.control} disabled={isViewMode} />
              
              <SalespersonField 
                control={form.control}
                profiles={profiles} 
                isLoading={profilesLoading} 
                error={profilesError}
                disabled={isViewMode}
              />
              
              <StatusField control={form.control} disabled={isViewMode} />
            </div>
            
            <NotesField control={form.control} disabled={isViewMode} />
          </div>

          {!isViewMode && (
            <LeadFormActions 
              isEditing={isEditing} 
              isSubmitting={form.formState.isSubmitting}
              loadingLead={loadingLead}
              onCancel={() => window.history.back()}
            />
          )}
        </form>
      </Form>
    </div>
  );
};
