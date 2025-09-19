
import React from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PipelineStageSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: string;
}

const PIPELINE_STAGES = [
  { value: 'Lead', label: 'Lead', color: 'bg-blue-500' },
  { value: 'Qualified', label: 'Qualified', color: 'bg-yellow-500' },
  { value: 'Proposal', label: 'Proposal', color: 'bg-orange-500' },
  { value: 'Closed Won', label: 'Closed Won', color: 'bg-green-500' },
  { value: 'Closed Lost', label: 'Closed Lost', color: 'bg-red-500' },
];

export const PipelineStageSelect = <T extends FieldValues = FieldValues>({ control, name }: PipelineStageSelectProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pipeline Stage</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select pipeline stage" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {PIPELINE_STAGES.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  <div className="flex items-center gap-2">
                    <Badge className={`${stage.color} text-white border-0 w-3 h-3 p-0`} />
                    {stage.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
