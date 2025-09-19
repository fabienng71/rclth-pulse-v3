
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Contact } from '@/hooks/useContactsData';
import { Mail, Phone, MessageCircle, MapPin, Building2, Calendar, ExternalLink } from 'lucide-react';

interface ContactExpandedRowProps {
  contact: Contact;
}

export const ContactExpandedRow: React.FC<ContactExpandedRowProps> = ({ contact }) => {
  const hasAdditionalInfo = contact.whatsapp || contact.line_id || contact.customer_code;
  
  return (
    <div className="px-4 py-6 bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Details
            </h4>
            <div className="space-y-2">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.telephone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <a 
                    href={`tel:${contact.telephone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.telephone}
                  </a>
                </div>
              )}
              {contact.whatsapp && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-3 w-3 text-muted-foreground" />
                  <span>WhatsApp: {contact.whatsapp}</span>
                </div>
              )}
              {contact.line_id && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-3 w-3 text-muted-foreground" />
                  <span>LINE: {contact.line_id}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Details
            </h4>
            <div className="space-y-2">
              {contact.account && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="ml-2 font-medium">{contact.account}</span>
                </div>
              )}
              {contact.position && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="ml-2">{contact.position}</span>
                </div>
              )}
              {contact.region && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {contact.region}
                  </Badge>
                </div>
              )}
              {contact.customer_code && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Customer Code:</span>
                  <span className="ml-2 font-mono text-xs bg-muted px-1 py-0.5 rounded">
                    {contact.customer_code}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="h-3 w-3 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-3 w-3 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="h-3 w-3 mr-2" />
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
