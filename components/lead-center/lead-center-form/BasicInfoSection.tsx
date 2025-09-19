import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadCenter } from '@/types/leadCenter';
import { LeadCenterFormData } from './leadCenterSchema';
import { FOOD_INGREDIENTS_SALES_STAGES } from '@/utils/channelMapping';

interface BasicInfoSectionProps {
  form: UseFormReturn<LeadCenterFormData>;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form }) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="lead_title">Lead Title *</Label>
        <Input
          id="lead_title"
          {...form.register('lead_title')}
          placeholder="Enter lead title"
        />
        {form.formState.errors.lead_title && (
          <p className="text-red-500 text-sm">{form.formState.errors.lead_title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead_description">Description</Label>
        <Textarea
          id="lead_description"
          {...form.register('lead_description')}
          placeholder="Describe this lead opportunity"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(value) => form.setValue('status', value as LeadCenter['status'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOOD_INGREDIENTS_SALES_STAGES.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead_source">Lead Source</Label>
          <Input
            id="lead_source"
            {...form.register('lead_source')}
            placeholder="e.g., Website, Referral, Cold Call"
          />
        </div>
      </div>
    </>
  );
};