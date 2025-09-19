
import React from 'react';
import { TitleField } from './fields/TitleField';
import { DescriptionField } from './fields/DescriptionField';
import { VendorField } from './fields/VendorField';
import { StatusField } from './fields/StatusField';
import { TargetFields } from './fields/TargetFields';
import { ActivitiesField } from './fields/ActivitiesField';
import { DateFields } from './fields/DateFields';
import { TargetAchievementField } from './fields/TargetAchievementField';

interface ProjectFormFieldsProps {
  activities?: string;
  isEdit?: boolean;
}

export const ProjectFormFields = ({ activities, isEdit = false }: ProjectFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <TitleField />
      <DescriptionField />
      <VendorField />
      <DateFields />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusField />
        <TargetFields />
      </div>
      {isEdit && <TargetAchievementField />}
      {isEdit && <ActivitiesField activities={activities} />}
    </div>
  );
};
