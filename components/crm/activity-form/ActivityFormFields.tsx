
import React, { memo, useEffect, useMemo } from 'react';
import { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ActivityFormData } from './formSchema';
import { EntityTypeSelector } from './EntityTypeSelector';
import { CustomerField } from '@/components/crm/CustomerField';
import { LeadField } from '@/components/crm/LeadField';
import { ActivityTypeSelect } from '@/components/crm/ActivityTypeSelect';
import { DatePickerField } from '@/components/crm/DatePickerField';
import { ContactNameField } from '@/components/crm/ContactNameField';
import { PipelineStageSelect } from './PipelineStageSelect';
import { NotesField } from '@/components/crm/NotesField';
import { SampleRequestField } from './SampleRequestField';
import { ProjectSelectField } from './ProjectSelectField';
import { SalespersonSelectField } from './SalespersonSelectField';
import { PreviousActivityField } from './PreviousActivityField';
import { QuotationSelectField } from './QuotationSelectField';
import { useProfilesList } from '@/hooks/useProfilesList';

interface ActivityFormFieldsProps {
  control: Control<ActivityFormData>;
  watch: UseFormWatch<ActivityFormData>;
  setValue: UseFormSetValue<ActivityFormData>;
  section?: 'entity' | 'details' | 'linking' | 'assignment' | 'notes';
  currentActivityId?: string;
}

export const ActivityFormFields: React.FC<ActivityFormFieldsProps> = memo(({
  control,
  watch,
  setValue,
  section = 'all',
  currentActivityId
}) => {
  // Optimize form watching to reduce re-renders
  const watchedValues = watch(['entity_type', 'customer_code', 'lead_id']);
  const [entityType, customerCode, leadId] = watchedValues;
  
  const { data: profiles } = useProfilesList();

  // DEBUG: Log renders only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('ActivityFormFields render - entityType:', entityType, 'customerCode:', customerCode, 'section:', section);
  }

  // Memoize expensive operations
  const handleSalespersonChange = useMemo(() => (salespersonId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Handling salesperson change:', salespersonId);
    }
    setValue('salesperson_id', salespersonId);
    
    const selectedProfile = profiles?.find(p => p.id === salespersonId);
    if (selectedProfile?.full_name) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Setting salesperson_name to:', selectedProfile.full_name);
      }
      setValue('salesperson_name', selectedProfile.full_name);
    }
  }, [profiles, setValue]);

  // All memoized sections must be declared unconditionally (Rules of Hooks)
  const entitySection = useMemo(() => (
    <div className="space-y-4">
      <EntityTypeSelector 
        control={control} 
        onEntityTypeChange={() => {}}
      />
      {entityType === 'lead' ? (
        <LeadField control={control} />
      ) : (
        <CustomerField control={control} />
      )}
    </div>
  ), [control, entityType]);

  const detailsSection = useMemo(() => (
    <div className="space-y-4">
      <ActivityTypeSelect control={control} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePickerField
          name="activity_date"
          label="Activity Date"
          control={control}
        />
        <DatePickerField
          name="follow_up_date"
          label="Follow-up Date"
          control={control}
          isOptional={true}
        />
      </div>
      <ContactNameField control={control} />
    </div>
  ), [control]);

  const linkingSection = useMemo(() => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SampleRequestField control={control} />
        <ProjectSelectField control={control} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuotationSelectField control={control} />
        <div></div>
      </div>
      <PreviousActivityField
        control={control}
        name="parent_activity_id"
        customerCode={customerCode}
        leadId={leadId}
        isLead={entityType === 'lead'}
        currentActivityId={currentActivityId}
      />
    </div>
  ), [control, customerCode, leadId, entityType, currentActivityId]);

  const assignmentSection = useMemo(() => (
    <div className="space-y-4">
      <PipelineStageSelect control={control} name="pipeline_stage" />
      <SalespersonSelectField control={control} setValue={setValue} />
    </div>
  ), [control, setValue]);

  const notesSection = useMemo(() => (
    <NotesField control={control} />
  ), [control]);

  // Legacy: All fields (fallback for backward compatibility) - MUST be declared before conditional returns
  const legacyAllFields = useMemo(() => (
    <div className="space-y-6">
      <EntityTypeSelector 
        control={control} 
        onEntityTypeChange={() => {}}
      />

      {entityType === 'lead' ? (
        <LeadField control={control} />
      ) : (
        <CustomerField control={control} />
      )}

      <ActivityTypeSelect control={control} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePickerField
          name="activity_date"
          label="Activity Date"
          control={control}
        />
        <DatePickerField
          name="follow_up_date"
          label="Follow-up Date"
          control={control}
          isOptional={true}
        />
      </div>

      {/* Remove customerCode prop to decorrelate contact search from customer selection */}
      <ContactNameField control={control} />

      <PipelineStageSelect control={control} name="pipeline_stage" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SampleRequestField control={control} />
        <ProjectSelectField control={control} />
      </div>

      <QuotationSelectField control={control} />

      <SalespersonSelectField control={control} setValue={setValue} />

      <NotesField control={control} />
    </div>
  ), [control, entityType, setValue]);

  // Section routing logic (after all hooks are declared)
  if (section === 'entity') {
    return entitySection;
  }

  if (section === 'details') {
    return detailsSection;
  }

  if (section === 'linking') {
    return linkingSection;
  }

  if (section === 'assignment') {
    return assignmentSection;
  }

  if (section === 'notes') {
    return notesSection;
  }

  return legacyAllFields;
});

// Display name for debugging
ActivityFormFields.displayName = 'ActivityFormFields';
