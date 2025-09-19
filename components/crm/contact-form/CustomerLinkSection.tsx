
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSearch } from "@/components/crm/CustomerSearch";
import { Customer } from "@/hooks/useCustomersData";
import { UseFormReturn } from 'react-hook-form';
import { ContactFormValues } from "./schema";
import { Link, User } from "lucide-react";

interface CustomerLinkSectionProps {
  form: UseFormReturn<ContactFormValues>;
  onSelectCustomer: (customer: Customer) => void;
  disabled?: boolean;
}

export const CustomerLinkSection: React.FC<CustomerLinkSectionProps> = ({
  form,
  onSelectCustomer,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          Link to Customer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerSearch 
          onSelectCustomer={onSelectCustomer}
          disabled={disabled}
        />
        {form.watch("customer_name") && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Linked to:</span>
              <span className="font-medium">{form.watch("customer_name")}</span>
              <span className="text-muted-foreground">({form.watch("customer_code")})</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
