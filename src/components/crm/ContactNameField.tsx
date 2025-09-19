
import React, { useState } from 'react';
import { Control, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOptimizedContactsData, Contact } from '@/hooks/useOptimizedContactsData';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Check, Plus, X, UserPlus } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { CreateContactModal } from './contact-form/CreateContactModal';
import { CreateLeadModal } from './lead-form/CreateLeadModal';

interface ContactNameFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  customerCode?: string; // Keep prop but don't use for filtering
}

export const ContactNameField = <T extends FieldValues = FieldValues>({ control, customerCode }: ContactNameFieldProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [createContactModalOpen, setCreateContactModalOpen] = useState(false);
  const [createLeadModalOpen, setCreateLeadModalOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Use optimized search without customer filtering - search all contacts
  const { contacts, loading } = useOptimizedContactsData(
    debouncedSearchTerm,
    'first_name',
    'asc',
    0, // page
    50, // pageSize - limit results for better performance
    'all', // salesperson
    'all', // region
    'all'  // status
  );

  // Remove customer code filtering - show all contacts that match search
  const displayContacts = contacts;

  const getDisplayName = (contact: Contact) => {
    const firstName = contact.first_name || '';
    const lastName = contact.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // If no name available, use account as fallback
    return fullName || contact.account || 'Unnamed Contact';
  };

  const getSecondaryInfo = (contact: Contact) => {
    const parts = [];
    if (contact.position) parts.push(contact.position);
    if (contact.account && contact.account !== getDisplayName(contact)) parts.push(contact.account);
    if (contact.email) parts.push(contact.email);
    return parts.join(' • ') || 'No additional info';
  };

  const handleClearContact = (field: { onChange: (value: string) => void }) => {
    field.onChange('');
    setSearchTerm('');
    setOpen(false);
  };

  return (
    <>
      <FormField
        control={control}
        name="contact_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Contact Name <span className="text-destructive">*</span>
            </FormLabel>
            
            {/* Show selected contact or search input */}
            {field.value && !searchTerm ? (
              <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded-md flex items-center justify-between">
                <span>Selected: {field.value}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearContact(field)}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Search all contacts by name, account, email, or position..."
                      value={searchTerm || ''}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value.length >= 2) {
                          setOpen(true);
                        } else {
                          setOpen(false);
                        }
                      }}
                      onClick={() => {
                        if (searchTerm.length >= 2) {
                          setOpen(true);
                        }
                      }}
                      className="pr-10"
                      autoComplete="off"
                    />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </FormControl>
                
                {open && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                    <div className="max-h-[300px] overflow-y-auto p-1">
                      {loading ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                          <span className="text-sm text-muted-foreground">Searching contacts...</span>
                        </div>
                      ) : debouncedSearchTerm.length < 2 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Type at least 2 characters to search
                        </div>
                      ) : (
                        <Command className="border-none">
                          <CommandList>
                            {displayContacts.length === 0 ? (
                              <CommandEmpty>
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                  No contacts found matching "{debouncedSearchTerm}"
                                </div>
                              </CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {displayContacts.slice(0, 10).map((contact) => (
                                  <CommandItem
                                    key={contact.id}
                                    value={contact.id}
                                    onSelect={() => {
                                      const contactFullName = getDisplayName(contact);
                                      field.onChange(contactFullName);
                                      setSearchTerm('');
                                      setOpen(false);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{getDisplayName(contact)}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {getSecondaryInfo(contact)}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Always visible outside dropdown */}
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateContactModalOpen(true)}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Contact
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateLeadModalOpen(true)}
                className="flex-1"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Lead
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        )}
      />

      <CreateContactModal
        open={createContactModalOpen}
        onOpenChange={setCreateContactModalOpen}
        onContactCreated={(newContact) => {
          const contactFullName = getDisplayName(newContact);
          // Use proper form setValue method instead of accessing internals
          (control as any).setValue?.('contact_name', contactFullName);
          setSearchTerm('');
        }}
        initialAccount={searchTerm}
      />

      <CreateLeadModal
        open={createLeadModalOpen}
        onOpenChange={setCreateLeadModalOpen}
        onLeadCreated={(newLead) => {
          // Optionally populate the contact field with the lead's contact name
          if (newLead.contact_name) {
            // Use proper form setValue method instead of accessing internals
            (control as any).setValue?.('contact_name', newLead.contact_name);
          }
          setSearchTerm('');
        }}
        initialCustomerName={searchTerm}
      />
    </>
  );
};
