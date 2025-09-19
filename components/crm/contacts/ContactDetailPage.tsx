
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  MessageCircle,
  Edit,
  Calendar,
  FileText,
  Tag as TagIcon
} from 'lucide-react';
import { ContactActivitiesTab } from './ContactActivitiesTab';
import { ContactNotesTab } from './ContactNotesTab';
import { ContactTags } from './ContactTags';
import { ContactHealthScore } from './ContactHealthScore';
import { ContactStatusBadge } from './ContactStatusBadge';
import { UniversalBackButton, UniversalBreadcrumb } from '@/components/common/navigation';

export const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: contact, isLoading, refetch } = useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      if (!id) throw new Error('Contact ID is required');
      
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_tag_assignments(
            contact_tags(
              id,
              name,
              color,
              description
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        tags: data.contact_tag_assignments?.map((assignment: any) => assignment.contact_tags) || []
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Contact Not Found</h2>
        <p className="text-muted-foreground">The contact you're looking for doesn't exist.</p>
      </div>
    );
  }

  const initials = `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase();

  const handleEditContact = () => {
    navigate(`/crm/contacts/${id}/edit`);
  };

  return (
    <div className="space-y-6">
      <UniversalBreadcrumb />
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <UniversalBackButton />
        <h1 className="text-2xl font-bold">Contact Details</h1>
      </div>

      {/* Contact Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={contact.photo_url} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {contact.first_name} {contact.last_name}
                  </h2>
                  <ContactStatusBadge status={contact.status} />
                  <ContactHealthScore score={contact.health_score} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {contact.position && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{contact.position}</span>
                    </div>
                  )}
                  {contact.account && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{contact.account}</span>
                    </div>
                  )}
                  {contact.region && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{contact.region}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={handleEditContact}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{contact.email}</p>
                </div>
              </div>
            )}
            
            {contact.telephone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{contact.telephone}</p>
                </div>
              </div>
            )}

            {contact.whatsapp && (
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{contact.whatsapp}</p>
                </div>
              </div>
            )}

            {contact.salesperson && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Salesperson</p>
                  <p className="font-medium">{contact.salesperson}</p>
                </div>
              </div>
            )}

            {contact.customer_code && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer Code</p>
                  <p className="font-medium">{contact.customer_code}</p>
                </div>
              </div>
            )}

            {contact.last_contact_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Contact</p>
                  <p className="font-medium">
                    {new Date(contact.last_contact_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-3">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Tags</span>
              </div>
              <ContactTags
                contactId={contact.id}
                tags={contact.tags}
                onTagsChange={refetch}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes ({contact.notes_count || 0})
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <ContactActivitiesTab 
            contactId={contact.id}
            customerCode={contact.customer_code}
            customerName={contact.customer_name}
          />
        </TabsContent>

        <TabsContent value="notes">
          <ContactNotesTab contactId={contact.id} />
        </TabsContent>

        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Manage Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactTags
                contactId={contact.id}
                tags={contact.tags}
                onTagsChange={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
