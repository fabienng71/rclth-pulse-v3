
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
import { useContactForm } from './useContactForm';
import { BasicContactFields } from './BasicContactFields';
import { EnhancedContactFields } from './EnhancedContactFields';
import { SalespersonSelect } from './SalespersonSelect';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactCreated: (contact: any) => void;
  initialAccount?: string;
}

export const CreateContactModal: React.FC<CreateContactModalProps> = ({
  open,
  onOpenChange,
  onContactCreated,
  initialAccount
}) => {
  const { form } = useContactForm();
  const { toast } = useToast();

  // Set initial account if provided
  React.useEffect(() => {
    if (initialAccount && open) {
      form.setValue('account', initialAccount);
    }
  }, [initialAccount, open, form]);

  const handleSubmit = async (data: any) => {
    try {
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert([data])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Contact has been created successfully",
      });
      
      // Pass the newly created contact back
      onContactCreated(newContact);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate form completion percentage
  const watchedValues = form.watch();
  const totalFields = 6; // first_name, last_name, account, email, telephone, region
  const completedFields = [
    watchedValues.first_name,
    watchedValues.last_name,
    watchedValues.account,
    watchedValues.email,
    watchedValues.telephone,
    watchedValues.region
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Create New Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to your network
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
              <BasicContactFields control={form.control} />
              
              <EnhancedContactFields control={form.control} />
              
              <SalespersonSelect control={form.control} />

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
                  {form.formState.isSubmitting ? 'Creating Contact...' : 'Create Contact'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
