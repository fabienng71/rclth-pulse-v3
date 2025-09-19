
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check, Plus } from 'lucide-react';
import { Control, FieldValues } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { CreateContactModal } from '@/components/crm/contact-form/CreateContactModal';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  position?: string | null;
}

interface ContactSearchFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  customerCode?: string;
}

export const ContactSearchField = <T extends FieldValues = FieldValues>({ control, customerCode }: ContactSearchFieldProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [openContactSearch, setOpenContactSearch] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [createContactModalOpen, setCreateContactModalOpen] = useState(false);

  useEffect(() => {
    const searchContacts = async () => {
      if (!customerCode || debouncedSearchTerm.length < 2) return;
      
      setIsSearching(true);
      
      try {
        let query = supabase
          .from('contacts')
          .select('id, first_name, last_name, email, position')
          .eq('customer_code', customerCode)
          .order('first_name', { ascending: true });
        
        // Filter by search term
        query = query.ilike('first_name', `%${debouncedSearchTerm}%`);
        
        const { data, error } = await query.limit(10);
        
        if (error) {
          throw error;
        }
        
        setContacts(data || []);
      } catch (error) {
        console.error('Error searching contacts:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    searchContacts();
  }, [customerCode, debouncedSearchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setOpenContactSearch(true);
    }
  }, [debouncedSearchTerm]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setOpenContactSearch(false);
    setSearchTerm('');
  };

  const handleContactCreated = (contact: Contact) => {
    setSelectedContact(contact);
    // Use proper form setValue method instead of accessing internals
    (control as any).setValue?.('contact_name', `${contact.first_name} ${contact.last_name}`);
  };

  return (
    <FormField
      control={control}
      name="contact_name"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Contact Name</FormLabel>
          <div className="relative">
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => {
                if (searchTerm.length >= 2) {
                  setOpenContactSearch(true);
                }
              }}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          
          {field.value && (
            <div className="text-sm text-muted-foreground mt-1 bg-blue-50 p-2 rounded-md">
              Selected: {selectedContact?.first_name} {selectedContact?.last_name}
              {selectedContact?.position && ` (${selectedContact.position})`}
            </div>
          )}
          
          <FormMessage />
          
          {openContactSearch && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
              <div className="max-h-[300px] overflow-y-auto p-1">
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <span className="text-sm text-muted-foreground">🔍 Searching contacts...</span>
                  </div>
                ) : searchTerm.length < 2 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No contacts found
                  </div>
                ) : (
                  <Command className="border-none">
                    <CommandList>
                      <CommandGroup>
                        {contacts.map((contact) => (
                          <CommandItem
                            key={contact.id}
                            value={contact.id}
                            onSelect={() => {
                              field.onChange(`${contact.first_name} ${contact.last_name}`);
                              handleSelectContact(contact);
                            }}
                            className="cursor-pointer"
                          >
                            <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                            <div className="flex flex-col">
                              <span>{contact.first_name} {contact.last_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {contact.position || 'No position'} - {contact.email || 'No email'}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                )}
              </div>
            </div>
          )}
          
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => setCreateContactModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Create New Contact
          </Button>
          
          <CreateContactModal
            open={createContactModalOpen}
            onOpenChange={setCreateContactModalOpen}
            onContactCreated={handleContactCreated}
            initialAccount={customerCode}
          />
        </FormItem>
      )}
    />
  );
};
