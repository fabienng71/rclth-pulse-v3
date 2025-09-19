
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { BasicInfoFields } from './BasicInfoFields';
import { ContactInfoFields } from './ContactInfoFields';
import { SalespersonField } from './SalespersonField';
import { StatusField } from './StatusField';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfilesList } from '@/hooks/useProfilesList';

interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated: (lead: any) => void;
  initialCustomerName?: string;
}

interface LeadFormValues {
  customer_name: string;
  contact_name?: string;
  position?: string;
  email?: string;
  phone?: string;
  status: string;
  salesperson_code?: string;
  notes?: string;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  open,
  onOpenChange,
  onLeadCreated,
  initialCustomerName
}) => {
  const { toast } = useToast();
  const { data: profiles = [], isLoading: profilesLoading, error: profilesError } = useProfilesList();

  const form = useForm<LeadFormValues>({
    defaultValues: {
      customer_name: '',
      contact_name: '',
      position: '',
      email: '',
      phone: '',
      status: 'New',
      salesperson_code: '',
      notes: ''
    }
  });

  // Set initial customer name if provided
  React.useEffect(() => {
    if (initialCustomerName && open) {
      form.setValue('customer_name', initialCustomerName);
    }
  }, [initialCustomerName, open, form]);

  const handleSubmit = async (data: LeadFormValues) => {
    try {
      // Find the selected salesperson's full name
      const selectedProfile = profiles.find(profile => profile.id === data.salesperson_code);
      const fullName = selectedProfile ? selectedProfile.full_name : null;

      const { data: newLead, error } = await supabase
        .from('leads')
        .insert([{
          customer_name: data.customer_name,
          contact_name: data.contact_name,
          position: data.position,
          email: data.email,
          phone: data.phone,
          status: data.status,
          salesperson_code: data.salesperson_code,
          full_name: fullName,
          notes: data.notes
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Lead has been created successfully",
      });
      
      // Pass the newly created lead back
      onLeadCreated(newLead);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate form completion percentage
  const watchedValues = form.watch();
  const totalFields = 6; // customer_name, contact_name, email, phone, status, salesperson_code
  const completedFields = [
    watchedValues.customer_name,
    watchedValues.contact_name,
    watchedValues.email,
    watchedValues.phone,
    watchedValues.status,
    watchedValues.salesperson_code
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Create New Lead</DialogTitle>
              <DialogDescription>
                Add a new lead to your pipeline
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <BasicInfoFields control={form.control} />
              
              <ContactInfoFields control={form.control} />
              
              <div className="grid gap-8 lg:grid-cols-2">
                <SalespersonField 
                  control={form.control}
                  disabled={form.formState.isSubmitting}
                  profiles={profiles} 
                  isLoading={profilesLoading} 
                  error={profilesError}
                />
                
                <StatusField 
                  control={form.control}
                  disabled={form.formState.isSubmitting}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="min-w-[100px]"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Creating Lead...' : 'Create Lead'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
