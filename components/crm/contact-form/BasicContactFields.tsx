
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { ContactFormValues } from "./schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";

interface BasicContactFieldsProps {
  control: Control<ContactFormValues>;
  disabled?: boolean;
}

export const BasicContactFields: React.FC<BasicContactFieldsProps> = ({ 
  control, 
  disabled = false 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  First Name
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John" 
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
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Doe" 
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
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position/Title</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="CHEF BAKER">CHEF BAKER</SelectItem>
                    <SelectItem value="CHEF DE CUISINE">CHEF DE CUISINE</SelectItem>
                    <SelectItem value="CHEF/OWNER">CHEF/OWNER</SelectItem>
                    <SelectItem value="COO">COO</SelectItem>
                    <SelectItem value="DIRECTOR OF CULINARY">DIRECTOR OF CULINARY</SelectItem>
                    <SelectItem value="EXECUTIVE CHEF">EXECUTIVE CHEF</SelectItem>
                    <SelectItem value="EXECUTIVE SOUS CHEF">EXECUTIVE SOUS CHEF</SelectItem>
                    <SelectItem value="F&B">F&B</SelectItem>
                    <SelectItem value="FOUNDER">FOUNDER</SelectItem>
                    <SelectItem value="GENERAL MANAGER">GENERAL MANAGER</SelectItem>
                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                    <SelectItem value="MERCHANDISER">MERCHANDISER</SelectItem>
                    <SelectItem value="OWNER">OWNER</SelectItem>
                    <SelectItem value="PASTRY CHEF">PASTRY CHEF</SelectItem>
                    <SelectItem value="PURCHASING">PURCHASING</SelectItem>
                    <SelectItem value="PURCHASING MANAGER">PURCHASING MANAGER</SelectItem>
                    <SelectItem value="R&D">R&D</SelectItem>
                    <SelectItem value="SALES">SALES</SelectItem>
                    <SelectItem value="SOUS CHEF">SOUS CHEF</SelectItem>
                    <SelectItem value="TEACHER">TEACHER</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="account"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company/Account
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Company name" 
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
