
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactAvatar } from './ContactAvatar';
import { ContactStatusBadge } from './ContactStatusBadge';
import { ContactHealthScore } from './ContactHealthScore';
import { ContactTags } from './ContactTags';
import { Contact } from '@/hooks/useContactsData';
import { Mail, Phone, MessageCircle, MapPin, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContactsGridProps {
  contacts: Contact[];
  selectedContacts?: Contact[];
  onSelectionChange?: (contacts: Contact[]) => void;
  onContactUpdate?: () => void;
}

export const ContactsGrid: React.FC<ContactsGridProps> = ({
  contacts,
  selectedContacts = [],
  onSelectionChange,
  onContactUpdate
}) => {
  const navigate = useNavigate();

  const handleContactClick = (contactId: string) => {
    navigate(`/crm/contacts/${contactId}`);
  };

  const handleSelectContact = (contact: Contact, checked: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...selectedContacts, contact]);
    } else {
      onSelectionChange(selectedContacts.filter(c => c.id !== contact.id));
    }
  };

  const isContactSelected = (contact: Contact) => {
    return selectedContacts.some(c => c.id === contact.id);
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">No contacts found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {contacts.map((contact) => (
        <Card 
          key={contact.id}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
          onClick={() => handleContactClick(contact.id)}
        >
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header with avatar, name, and selection */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <ContactAvatar 
                    firstName={contact.first_name}
                    lastName={contact.last_name}
                    email={contact.email}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate">
                      {contact.first_name} {contact.last_name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.position || 'No position'}
                    </p>
                  </div>
                </div>
                {onSelectionChange && (
                  <Checkbox
                    checked={isContactSelected(contact)}
                    onCheckedChange={(checked) => handleSelectContact(contact, !!checked, event as any)}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-2"
                  />
                )}
              </div>

              {/* Status and Health Score */}
              <div className="flex items-center justify-between">
                <ContactStatusBadge status={contact.status} />
                <ContactHealthScore score={contact.health_score} size="sm" />
              </div>

              {/* Company Information */}
              {contact.account && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{contact.account}</span>
                </div>
              )}

              {/* Contact Methods */}
              <div className="space-y-1">
                {contact.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.telephone && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{contact.telephone}</span>
                  </div>
                )}
                {contact.whatsapp && (
                  <div className="flex items-center gap-2 text-xs">
                    <MessageCircle className="h-3 w-3 text-muted-foreground" />
                    <span>WhatsApp: {contact.whatsapp}</span>
                  </div>
                )}
              </div>

              {/* Region */}
              {contact.region && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{contact.region}</span>
                </div>
              )}

              {/* Tags */}
              <div onClick={(e) => e.stopPropagation()}>
                <ContactTags 
                  contactId={contact.id}
                  tags={contact.tags || []}
                  onTagsChange={onContactUpdate}
                  className="flex-wrap"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contact.email) {
                      window.location.href = `mailto:${contact.email}`;
                    }
                  }}
                  disabled={!contact.email}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contact.telephone) {
                      window.location.href = `tel:${contact.telephone}`;
                    }
                  }}
                  disabled={!contact.telephone}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
