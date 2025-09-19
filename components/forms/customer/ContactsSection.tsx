
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerRequestFormValues } from './schema';

export const ContactsSection = () => {
  const form = useFormContext<CustomerRequestFormValues>();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });

  const addContact = () => {
    append({
      name: '',
      position: '',
      phone: '',
      email: '',
      line: '',
      whatsapp: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contact Information</h3>
        <Button 
          type="button" 
          onClick={addContact} 
          variant="outline" 
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Contact
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No contacts added. Click "Add Contact" to add contact information.
        </div>
      )}
      
      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name={`contacts.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Contact name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`contacts.${index}.position`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Position" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <FormField
                control={form.control}
                name={`contacts.${index}.phone`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`contacts.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <FormField
                control={form.control}
                name={`contacts.${index}.line`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Line ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`contacts.${index}.whatsapp`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="WhatsApp number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
