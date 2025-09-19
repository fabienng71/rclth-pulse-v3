import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LeaveFormData } from '@/types/leave';
import { DurationDisplay } from './DurationDisplay';

interface LeaveFormFieldsProps {
  form: UseFormReturn<LeaveFormData>;
  onSubmit: (data: LeaveFormData) => Promise<void>;
  isSubmitting: boolean;
  validationError: string | null;
  calculatedDays: number | null;
  isCalculating: boolean;
  leaveType: string;
}

export const LeaveFormFields: React.FC<LeaveFormFieldsProps> = ({
  form,
  onSubmit,
  isSubmitting,
  validationError,
  calculatedDays,
  isCalculating,
  leaveType,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="leave_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Annual">Annual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Business Leave">Business Leave</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide a detailed reason for your leave request..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Minimum 10 characters required
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DurationDisplay
          calculatedDays={calculatedDays}
          isCalculating={isCalculating}
          validationError={validationError}
          leaveType={leaveType as any}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting || !!validationError || calculatedDays === null}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  );
};