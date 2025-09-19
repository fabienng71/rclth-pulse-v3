import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
// Removed Command components to avoid cmdk iteration issues
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { QuotationWithItems } from '@/types/quotations';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  email: string;
  name: string;
  customer_code?: string;
  customer_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  type: 'contact' | 'lead';
}

interface ContactSelectorProps {
  quotation: QuotationWithItems;
  selected: Contact[];
  onChange: (contacts: Contact[]) => void;
  className?: string;
}

export const ContactSelector = ({
  quotation,
  selected = [],
  onChange,
  className
}: ContactSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Ensure contacts is always an array - defensive check
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  
  // Filter contacts based on search term
  const filteredContacts = safeContacts.filter(contact => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      (contact.customer_name && contact.customer_name.toLowerCase().includes(search)) ||
      (contact.position && contact.position.toLowerCase().includes(search))
    );
  });

  useEffect(() => {
    fetchContacts();
  }, [quotation]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const allContacts: Contact[] = [];
      
      // Validate quotation object
      if (!quotation) {
        console.error('No quotation provided to ContactSelector');
        return;
      }

      console.log('=== CONTACT SELECTOR DEBUG ===');
      console.log('Quotation object:', quotation);
      console.log('Is lead?', quotation.is_lead);
      console.log('Customer code:', quotation.customer_code);
      console.log('Customer name:', quotation.customer_name);
      console.log('Lead ID:', quotation.lead_id);

      // Fetch ALL contacts and leads from the database for comprehensive search
      console.log('Fetching all contacts and leads for comprehensive search...');
      
      // Fetch all contacts with email addresses
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, email, first_name, last_name, customer_code, customer_name, position')
        .not('email', 'is', null)
        .neq('email', '')
        .order('customer_name', { ascending: true });

      // Fetch all leads with email addresses
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, email, contact_name, customer_name')
        .not('email', 'is', null)
        .neq('email', '')
        .order('customer_name', { ascending: true });

      console.log('Query results:', { 
        contacts: { data: contactsData?.length, error: contactsError },
        leads: { data: leadsData?.length, error: leadsError }
      });

      // Process contacts
      if (contactsData && !contactsError && Array.isArray(contactsData)) {
        const processedContacts = contactsData.map(contact => ({
          id: contact.id,
          email: contact.email,
          name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 
                contact.customer_name || 'Contact',
          customer_code: contact.customer_code,
          customer_name: contact.customer_name,
          first_name: contact.first_name,
          last_name: contact.last_name,
          position: contact.position,
          type: 'contact' as const
        }));
        allContacts.push(...processedContacts);
      }

      // Process leads
      if (leadsData && !leadsError && Array.isArray(leadsData)) {
        const processedLeads = leadsData.map(lead => ({
          id: lead.id,
          email: lead.email,
          name: lead.contact_name || lead.customer_name || 'Lead Contact',
          customer_name: lead.customer_name,
          type: 'lead' as const
        }));
        allContacts.push(...processedLeads);
      }

      // Ensure allContacts is always an array
      const safeContacts = Array.isArray(allContacts) ? allContacts : [];
      
      // Remove duplicates by email
      const uniqueContacts = safeContacts.filter((contact, index, self) =>
        index === self.findIndex(c => c.email === contact.email)
      );

      // Ensure uniqueContacts is always an array before setting state
      const finalContacts = Array.isArray(uniqueContacts) ? uniqueContacts : [];
      console.log('Final contacts to display:', finalContacts);
      setContacts(finalContacts);

      // Don't auto-select when showing all contacts - let user choose
      console.log('Contacts loaded, letting user choose recipients');
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Ensure we always set a safe empty array on error
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (contact: Contact) => {
    const safeSelected = selected || [];
    const isSelected = safeSelected.some(c => c.id === contact.id);
    if (isSelected) {
      onChange(safeSelected.filter(c => c.id !== contact.id));
    } else {
      onChange([...safeSelected, contact]);
    }
  };

  const selectAll = () => {
    onChange(safeContacts);
  };

  const clearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    const safeSelected = selected || [];
    if (safeSelected.length === 0) {
      return loading ? "Loading contacts..." : "Select recipients...";
    }
    if (safeSelected.length === 1) return safeSelected[0].name;
    return `${safeSelected.length} recipients selected`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Email Recipients</label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={selectAll}
            disabled={safeContacts.length === 0 || (selected || []).length === safeContacts.length}
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={(selected || []).length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {loading ? "Loading contacts..." : getDisplayText()}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0">
          {/* Simple list instead of Command to avoid cmdk iteration issues */}
          <div className="max-h-[300px] overflow-auto">
            <div className="p-2 border-b">
              <input 
                type="text" 
                placeholder="Search contacts by name, email, company..." 
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchTerm ? `No contacts found matching "${searchTerm}"` : 'No contacts found.'}
              </div>
            ) : (
              <div className="p-1">
                {filteredContacts.map((contact) => {
                  const isSelected = (selected || []).some(c => c.id === contact.id);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => toggleContact(contact)}
                      className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer rounded-sm"
                    >
                      <Checkbox checked={isSelected} />
                      <div className="flex items-center gap-2 flex-1">
                        {contact.type === 'lead' ? (
                          <User className="h-4 w-4 text-purple-500" />
                        ) : (
                          <Users className="h-4 w-4 text-blue-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{contact.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {contact.email}
                          </div>
                          {contact.customer_name && (
                            <div className="text-xs text-muted-foreground truncate">
                              {contact.customer_name}
                            </div>
                          )}
                          {contact.position && (
                            <div className="text-xs text-muted-foreground">
                              {contact.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected contacts display */}
      {(selected || []).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(selected || []).map((contact) => (
            <Badge
              key={contact.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {contact.type === 'lead' ? (
                <User className="h-3 w-3" />
              ) : (
                <Users className="h-3 w-3" />
              )}
              {contact.name}
              <button
                onClick={() => toggleContact(contact)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {safeContacts.length === 0 && !loading && (
        <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No contacts found for this {quotation.is_lead ? 'lead' : 'customer'}.</p>
          <p className="text-xs mt-1">
            Make sure the {quotation.is_lead ? 'lead' : 'customer'} has contacts with email addresses in the system.
          </p>
        </div>
      )}
    </div>
  );
};