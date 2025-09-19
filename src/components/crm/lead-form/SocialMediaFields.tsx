
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { LeadFormValues } from "@/hooks/useLeadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialMediaFieldsProps {
  control: Control<LeadFormValues>;
  disabled?: boolean;
}

export const SocialMediaFields: React.FC<SocialMediaFieldsProps> = ({ control, disabled }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Online Presence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://company.com" 
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
                      onClick={() => window.open(field.value, '_blank')}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="instagram_handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram Handle
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="@username" 
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
                      onClick={() => window.open(`https://instagram.com/${field.value.replace('@', '')}`, '_blank')}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
