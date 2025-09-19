
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { LeadFormValues } from "@/hooks/useLeadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactInfoFieldsProps {
  control: Control<LeadFormValues>;
  disabled?: boolean;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({ control, disabled }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="contact@company.com" 
                        {...field} 
                        disabled={disabled}
                        className="h-11"
                      />
                    </FormControl>
                    {field.value && !disabled && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${field.value}`, '_blank')}
                        className="shrink-0"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+66 X XXXX XXXX" 
                        {...field} 
                        disabled={disabled}
                        className="h-11"
                      />
                    </FormControl>
                    {field.value && !disabled && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${field.value}`, '_blank')}
                        className="shrink-0"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={control}
              name="line_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Line ID
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="@lineid or phone number" 
                      {...field} 
                      disabled={disabled}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+66 X XXXX XXXX" 
                      {...field} 
                      disabled={disabled}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
