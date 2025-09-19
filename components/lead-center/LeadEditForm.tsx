import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadCenter } from '@/types/leadCenter';
import { useLeadManagement } from '@/hooks/useLeadManagement';
import { ContactSearch } from './ContactSearch';
import { Contact } from '@/types/contact';
import { CHANNEL_MAPPING, FOOD_INGREDIENTS_SALES_STAGES } from '@/utils/channelMapping';

const leadEditSchema = z.object({
  lead_title: z.string().min(1, 'Lead title is required'),
  lead_description: z.string().optional(),
  status: z.enum(['contacted', 'meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating', 'closed_won', 'closed_lost']),
  lead_source: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  next_step: z.string().optional(),
  next_step_due: z.string().optional(),
  estimated_value: z.number().optional(),
  close_probability: z.number().min(0).max(100).optional(),
  contact_id: z.string().optional().nullable(),
  customer_channel: z.string().optional(),
});

type LeadEditFormData = z.infer<typeof leadEditSchema>;

interface LeadEditFormProps {
  lead: LeadCenter;
  onCancel: () => void;
  onSuccess: () => void;
}

export const LeadEditForm: React.FC<LeadEditFormProps> = ({ lead, onCancel, onSuccess }) => {
  const { lead: fetchedLead, isLoading, updateLead } = useLeadManagement(lead.id);

  const form = useForm<LeadEditFormData>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: {
      lead_title: '',
      lead_description: '',
      status: 'Open',
      lead_source: '',
      priority: 'Medium',
      next_step: '',
      next_step_due: '',
      estimated_value: undefined,
      close_probability: undefined,
      contact_id: null,
      customer_channel: undefined,
      sales_stage: 'contacted',
    },
  });

  useEffect(() => {
    if (fetchedLead) {
      form.reset({
        lead_title: fetchedLead.lead_title,
        lead_description: fetchedLead.lead_description || '',
        status: fetchedLead.status,
        lead_source: fetchedLead.lead_source || '',
        priority: fetchedLead.priority,
        next_step: fetchedLead.next_step || '',
        next_step_due: fetchedLead.next_step_due || '',
        estimated_value: fetchedLead.estimated_value || undefined,
        close_probability: fetchedLead.close_probability || undefined,
        contact_id: fetchedLead.contact_id || null,
        customer_channel: fetchedLead.customer_channel || undefined,
        sales_stage: fetchedLead.sales_stage || 'contacted',
      });
    }
  }, [fetchedLead, form]);

  const handleSelectContact = (contact: Contact | null) => {
    form.setValue('contact_id', contact ? contact.id : null);
  };

  const onSubmit = async (data: LeadEditFormData) => {
    try {
      await updateLead(data);
      onSuccess();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading lead data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Contact</Label>
            <ContactSearch
              onSelectContact={handleSelectContact}
              initialContact={fetchedLead?.contact}
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_title">Lead Title *</Label>
              <Input
                id="lead_title"
                {...form.register('lead_title')}
                placeholder="Enter lead title"
              />
              {form.formState.errors.lead_title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lead_title.message}
                </p>
              )}
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

          <div className="space-y-2">
            <Label htmlFor="lead_description">Description</Label>
            <Textarea
              id="lead_description"
              {...form.register('lead_description')}
              placeholder="Describe the lead opportunity"
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Food Ingredients Industry Specific Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Sales Stage</Label>
              <Select
                value={form.watch('sales_stage') || 'contacted'}
                onValueChange={(value) => form.setValue('sales_stage', value as any)}
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
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_value">Estimated Value (THB)</Label>
              <Input
                id="estimated_value"
                type="number"
                step="0.01"
                {...form.register('estimated_value', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_step_due">Next Step Due Date</Label>
              <Input
                id="next_step_due"
                type="date"
                {...form.register('next_step_due')}
              />
            </div>
          </div>

          {/* Next Step */}
          <div className="space-y-2">
            <Label htmlFor="next_step">Next Step</Label>
            <Textarea
              id="next_step"
              {...form.register('next_step')}
              placeholder="Describe the next action to take"
              rows={2}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Updating...' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
