
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Building, MapPin, Phone, Mail, FileText, CreditCard, Calendar } from 'lucide-react';

interface Contact {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  line?: string;
  whatsapp?: string;
}

interface EnhancedCustomerRequestViewProps {
  request: {
    id: string;
    customer_name: string;
    search_name?: string;
    customer_type_code?: string;
    salesperson_code?: string;
    address?: string;
    city?: string;
    company_name?: string;
    company_address?: string;
    company_city?: string;
    customer_group?: string;
    region?: string;
    contacts?: Contact[];
    documents?: {
      pp20?: boolean;
      company_registration?: boolean;
      id_card?: boolean;
    };
    credit_limit?: number;
    credit_terms?: string;
    prepayment?: boolean;
    status: string;
    created_at: string;
    created_by?: string;
  };
}

export const EnhancedCustomerRequestView: React.FC<EnhancedCustomerRequestViewProps> = ({ request }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {request.customer_name}
              </CardTitle>
              {request.search_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  Search Name: {request.search_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
              <div className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(request.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Customer Type</label>
              <p className="text-sm text-muted-foreground">{request.customer_type_code || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Salesperson</label>
              <p className="text-sm text-muted-foreground">{request.salesperson_code || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <p className="text-sm text-muted-foreground">{request.region || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Customer Group</label>
              <p className="text-sm text-muted-foreground">{request.customer_group || 'Not specified'}</p>
            </div>
            {request.address && (
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Address
                </label>
                <p className="text-sm text-muted-foreground">
                  {request.address}
                  {request.city && `, ${request.city}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information */}
        {request.company_name && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <p className="text-sm text-muted-foreground">{request.company_name}</p>
              </div>
              {request.company_address && (
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Company Address
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {request.company_address}
                    {request.company_city && `, ${request.company_city}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contacts */}
      {request.contacts && request.contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.contacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium">{contact.name}</div>
                  {contact.position && (
                    <div className="text-sm text-muted-foreground">{contact.position}</div>
                  )}
                  <div className="mt-2 space-y-1">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                    )}
                    {contact.line && (
                      <div className="text-sm">
                        <strong>Line:</strong> {contact.line}
                      </div>
                    )}
                    {contact.whatsapp && (
                      <div className="text-sm">
                        <strong>WhatsApp:</strong> {contact.whatsapp}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">PP20</span>
              <Badge variant={request.documents?.pp20 ? "default" : "secondary"}>
                {request.documents?.pp20 ? 'Required' : 'Not Required'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Company Registration</span>
              <Badge variant={request.documents?.company_registration ? "default" : "secondary"}>
                {request.documents?.company_registration ? 'Required' : 'Not Required'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ID Card</span>
              <Badge variant={request.documents?.id_card ? "default" : "secondary"}>
                {request.documents?.id_card ? 'Required' : 'Not Required'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Credit Limit</label>
              <p className="text-sm text-muted-foreground">
                {request.credit_limit ? `$${request.credit_limit.toLocaleString()}` : 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Credit Terms</label>
              <p className="text-sm text-muted-foreground">{request.credit_terms || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Prepayment Required</label>
              <p className="text-sm text-muted-foreground">
                {request.prepayment ? 'Yes' : 'No'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
