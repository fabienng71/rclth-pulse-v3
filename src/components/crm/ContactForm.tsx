
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useContactForm } from "./contact-form/useContactForm";
import { Customer } from "@/hooks/useCustomersData";
import { SalespersonSelect } from "./contact-form/SalespersonSelect";
import { BasicContactFields } from "./contact-form/BasicContactFields";
import { EnhancedContactFields } from "./contact-form/EnhancedContactFields";
import { CustomerLinkSection } from "./contact-form/CustomerLinkSection";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

export const ContactForm = () => {
  const navigate = useNavigate();
  const { form, onSubmit, isEditing } = useContactForm();

  const handleSelectCustomer = (customer: Customer) => {
    form.setValue("customer_code", customer.customer_code);
    form.setValue("customer_name", customer.customer_name);
    form.setValue("search_name", customer.search_name || "");
    // Also set the account name to match the customer
    form.setValue("account", customer.customer_name);
  };

  // Calculate form completion percentage
  const watchedValues = form.watch();
  const totalFields = 7; // first_name, last_name, account, email, telephone, region, salesperson
  const completedFields = [
    watchedValues.first_name,
    watchedValues.last_name,
    watchedValues.account,
    watchedValues.email,
    watchedValues.telephone,
    watchedValues.region,
    watchedValues.salesperson
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress indicator for new contacts */}
      {!isEditing && (
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
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomerLinkSection 
            form={form}
            onSelectCustomer={handleSelectCustomer}
          />

          <BasicContactFields control={form.control} />
          
          <EnhancedContactFields control={form.control} />
          
          <div className="grid gap-8 lg:grid-cols-1">
            <SalespersonSelect control={form.control} />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/crm/contacts")}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="min-w-[100px]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting 
                ? (isEditing ? 'Updating Contact...' : 'Creating Contact...') 
                : isEditing 
                  ? 'Update Contact' 
                  : 'Create Contact'
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
