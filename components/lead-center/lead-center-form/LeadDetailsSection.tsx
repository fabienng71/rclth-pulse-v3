import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadCenter } from '@/types/leadCenter';
import { LeadCenterFormData } from './leadCenterSchema';
import { CHANNEL_MAPPING } from '@/utils/channelMapping';

interface LeadDetailsSectionProps {
  form: UseFormReturn<LeadCenterFormData>;
}

export const LeadDetailsSection: React.FC<LeadDetailsSectionProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lead Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimated_value">Estimated Value</Label>
          <Input
            id="estimated_value"
            type="number"
            step="0.01"
            min="0"
            {...form.register('estimated_value', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={form.watch('priority')}
            onValueChange={(value) => form.setValue('priority', value as LeadCenter['priority'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="close_probability">Close Probability (%)</Label>
          <Input
            id="close_probability"
            type="number"
            min="0"
            max="100"
            {...form.register('close_probability', { valueAsNumber: true })}
            placeholder="0-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Customer Channel</Label>
        <Select
          value={form.watch('customer_channel') || undefined}
          onValueChange={(value) => form.setValue('customer_channel', value === 'none' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {Object.entries(CHANNEL_MAPPING).map(([code, info]) => (
              <SelectItem key={code} value={code}>
                {info.name} ({code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};