
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { ContactFormValues } from "./schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";

interface EnhancedContactFieldsProps {
  control: Control<ContactFormValues>;
  disabled?: boolean;
}

export const EnhancedContactFields: React.FC<EnhancedContactFieldsProps> = ({ 
  control, 
  disabled = false 
}) => {
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
              name="telephone"
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
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
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
                        onClick={() => window.open(`https://wa.me/${field.value.replace(/\D/g, '')}`, '_blank')}
                        className="shrink-0"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="line_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    LINE ID
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
          </div>

          <FormField
            control={control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Region
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Geographic region or location" 
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
      </CardContent>
    </Card>
  );
};
