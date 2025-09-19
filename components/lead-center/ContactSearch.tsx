
import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Contact } from '@/types/contact';

interface ContactSearchProps {
  onSelectContact: (contact: Contact | null) => void;
  initialContact?: Partial<Contact> | null;
}

export const ContactSearch: React.FC<ContactSearchProps> = ({ onSelectContact, initialContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Partial<Contact> | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (initialContact) {
      setSelectedContact(initialContact);
    }
  }, [initialContact]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsLoading(true);
      const searchContacts = async () => {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email')
          .or(`first_name.ilike.%${debouncedSearchTerm}%,last_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%`)
          .limit(10);
        
        if (error) {
          console.error('Error searching contacts:', error);
        } else {
          setResults(data as Contact[]);
        }
        setIsLoading(false);
      };
      searchContacts();
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleSelect = (contact: Contact) => {
    setSelectedContact(contact);
    onSelectContact(contact);
    setSearchTerm('');
    setResults([]);
  };

  const handleChange = () => {
    setSelectedContact(null);
    onSelectContact(null);
  };

  if (selectedContact) {
    return (
      <div className="flex items-center justify-between p-2 border rounded-md bg-muted">
        <div className="text-sm">
          <div className="font-medium">{selectedContact.first_name} {selectedContact.last_name}</div>
          <div className="text-xs text-muted-foreground">{selectedContact.email}</div>
        </div>
        <Button variant="link" onClick={handleChange}>
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for a contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      {isLoading && <p className="p-2 text-sm text-muted-foreground">Searching...</p>}
      {results.length > 0 && (
        <ul className="border rounded-md max-h-60 overflow-y-auto bg-background">
          {results.map(contact => (
            <li
              key={contact.id}
              onClick={() => handleSelect(contact)}
              className="p-2 hover:bg-muted cursor-pointer text-sm"
            >
              <div className="font-medium">{contact.first_name} {contact.last_name}</div>
              <div className="text-xs text-muted-foreground">{contact.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
