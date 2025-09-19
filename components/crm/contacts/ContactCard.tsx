
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MessageCircle, User, Building2, MapPin } from "lucide-react";
import { Contact } from "@/hooks/useContactsData";
import { useNavigate } from "react-router-dom";

interface ContactCardProps {
  contact: Contact;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const navigate = useNavigate();

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleQuickAction = (e: React.MouseEvent, action: string, value: string) => {
    e.stopPropagation();
    if (!value) return;
    
    switch (action) {
      case 'email':
        window.open(`mailto:${value}`, '_blank');
        break;
      case 'phone':
        window.open(`tel:${value}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${value.replace(/\D/g, '')}`, '_blank');
        break;
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/crm/contacts/${contact.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(contact.first_name, contact.last_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg truncate">
                {contact.first_name} {contact.last_name}
              </h3>
              {contact.salesperson && (
                <Badge variant="secondary" className="text-xs">
                  {contact.salesperson}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              {contact.position && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="truncate">{contact.position}</span>
                </div>
              )}
              
              {contact.account && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{contact.account}</span>
                </div>
              )}
              
              {contact.region && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{contact.region}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {contact.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleQuickAction(e, 'email', contact.email)}
                  className="h-8 px-2"
                >
                  <Mail className="h-3 w-3" />
                </Button>
              )}
              
              {contact.telephone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleQuickAction(e, 'phone', contact.telephone)}
                  className="h-8 px-2"
                >
                  <Phone className="h-3 w-3" />
                </Button>
              )}
              
              {contact.whatsapp && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleQuickAction(e, 'whatsapp', contact.whatsapp)}
                  className="h-8 px-2"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
