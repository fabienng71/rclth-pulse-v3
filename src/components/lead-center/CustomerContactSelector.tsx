import React, { useState, useEffect } from 'react';
import { Building2, User, Plus, Search, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerSearch } from '@/components/crm/CustomerSearch';
import { ContactSearch } from './ContactSearch';
import { CreateContactModal } from '../crm/contact-form/CreateContactModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/hooks/useCustomersData';
import { Contact } from '@/types/contact';

interface CustomerContactSelectorProps {
  onCustomerSelect: (customer: Customer | null) => void;
  onContactSelect: (contact: Contact | null) => void;
  selectedCustomer?: Customer | null;
  selectedContact?: Contact | null;
  disabled?: boolean;
}

export const CustomerContactSelector: React.FC<CustomerContactSelectorProps> = ({
  onCustomerSelect,
  onContactSelect,
  selectedCustomer,
  selectedContact,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [isCreateContactModalOpen, setCreateContactModalOpen] = useState(false);
  const [customerContacts, setCustomerContacts] = useState<Contact[]>([]);
  const [selectedTab, setSelectedTab] = useState<'customer' | 'contact'>('customer');
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Load contacts for selected customer
  useEffect(() => {
    const loadCustomerContacts = async () => {
      if (!selectedCustomer?.customer_code) {
        setCustomerContacts([]);
        return;
      }

      setIsLoadingContacts(true);
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('customer_code', selectedCustomer.customer_code)
          .order('first_name');

        if (error) throw error;
        setCustomerContacts(data || []);
      } catch (error: any) {
        console.error('Error loading customer contacts:', error);
        toast({
          title: "Error Loading Contacts",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingContacts(false);
      }
    };

    loadCustomerContacts();
  }, [selectedCustomer?.customer_code, toast]);

  // When a customer is selected, clear any previously selected contact
  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    onContactSelect(null); // Clear contact selection when customer changes
  };

  // When a contact is selected, try to find and set the related customer
  const handleContactSelect = async (contact: Contact) => {
    onContactSelect(contact);

    // If contact has customer_code, try to load the customer
    if (contact.customer_code && !selectedCustomer) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_code', contact.customer_code)
          .single();

        if (error) {
          console.warn('Could not find customer for contact:', error);
          return;
        }

        if (data) {
          onCustomerSelect(data);
          toast({
            title: "Customer Auto-Selected",
            description: `Automatically selected customer: ${data.customer_name}`,
          });
        }
      } catch (error) {
        console.warn('Error auto-selecting customer:', error);
      }
    }
  };

  const handleContactCreated = (contact: Contact) => {
    handleContactSelect(contact);
    setCreateContactModalOpen(false);
  };

  const handleCustomerContactSelect = (contact: Contact) => {
    onContactSelect(contact);
  };

  const clearSelections = () => {
    onCustomerSelect(null);
    onContactSelect(null);
    setCustomerContacts([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Customer & Contact Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Selections Display */}
        {(selectedCustomer || selectedContact) && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Selected:</span>
              <Button variant="ghost" size="sm" onClick={clearSelections}>
                Clear All
              </Button>
            </div>
            
            {selectedCustomer && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <strong>Customer:</strong> {selectedCustomer.customer_name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {selectedCustomer.customer_code}
                </Badge>
              </div>
            )}
            
            {selectedContact && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Contact:</strong> {selectedContact.first_name} {selectedContact.last_name}
                </span>
                {selectedContact.email && (
                  <Badge variant="outline" className="text-xs">
                    {selectedContact.email}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selection Interface */}
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'customer' | 'contact')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Search Customer
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Search Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Select an existing customer to create a lead for upselling, cross-selling, or new products.
              </AlertDescription>
            </Alert>

            <CustomerSearch 
              onSelectCustomer={handleCustomerSelect} 
              disabled={disabled}
            />

            {/* Customer Contacts */}
            {selectedCustomer && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Contacts for {selectedCustomer.customer_name}:
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCreateContactModalOpen(true)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Contact
                  </Button>
                </div>

                {isLoadingContacts ? (
                  <div className="text-sm text-muted-foreground">Loading contacts...</div>
                ) : customerContacts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {customerContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedContact?.id === contact.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleCustomerContactSelect(contact)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">
                              {contact.first_name} {contact.last_name}
                            </span>
                            {contact.email && (
                              <span className="text-sm text-muted-foreground ml-2">
                                {contact.email}
                              </span>
                            )}
                          </div>
                          {selectedContact?.id === contact.id && (
                            <Badge variant="default" className="text-xs">Selected</Badge>
                          )}
                        </div>
                        {contact.telephone && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {contact.telephone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No contacts found for this customer.
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => setCreateContactModalOpen(true)}
                      className="p-0 ml-1 h-auto"
                    >
                      Create the first contact.
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Search for a specific contact. If they belong to an existing customer, we'll link them automatically.
              </AlertDescription>
            </Alert>

            <ContactSearch 
              onSelectContact={handleContactSelect} 
              disabled={disabled}
            />

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateContactModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Contact
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Contact Modal */}
        <CreateContactModal
          isOpen={isCreateContactModalOpen}
          onClose={() => setCreateContactModalOpen(false)}
          onContactCreated={handleContactCreated}
          initialCustomerCode={selectedCustomer?.customer_code}
        />
      </CardContent>
    </Card>
  );
};