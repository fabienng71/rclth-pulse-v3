import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LeadCenterFormData } from './leadCenterSchema';

interface NextStepsSectionProps {
  form: UseFormReturn<LeadCenterFormData>;
}

export const NextStepsSection: React.FC<NextStepsSectionProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Next Steps</h3>
      
      <div className="space-y-2">
        <Label htmlFor="next_step">Next Step</Label>
        <Textarea
          id="next_step"
          {...form.register('next_step')}
          placeholder="What's the next action to take on this lead?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="next_step_due">Due Date</Label>
        <Input
          id="next_step_due"
          type="date"
          {...form.register('next_step_due')}
        />
      </div>
    </div>
  );
};