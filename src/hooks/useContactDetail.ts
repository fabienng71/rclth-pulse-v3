
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Contact } from './useContactsData';

export function useContactDetail(contactId: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError(null);

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
        .eq('id', contactId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const contactWithTags = {
          ...data,
          tags: data.contact_tag_assignments?.map((assignment: any) => assignment.contact_tags) || []
        };
        setContact(contactWithTags);
      } else {
        setContact(null);
        setError('Contact not found');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      setError('Failed to load contact details');
      toast({
        title: "Error",
        description: "Failed to load contact details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  return {
    contact,
    loading,
    error,
    refetch: fetchContact
  };
}
