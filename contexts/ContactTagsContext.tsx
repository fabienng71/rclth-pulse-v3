
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ContactTag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface ContactTagsContextType {
  tags: ContactTag[];
  loading: boolean;
  createTag: (tag: Omit<ContactTag, 'id'>) => Promise<ContactTag | undefined>;
  deleteTag: (tagId: string) => Promise<void>;
  assignTagToContact: (contactId: string, tagId: string) => Promise<void>;
  removeTagFromContact: (contactId: string, tagId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const ContactTagsContext = createContext<ContactTagsContextType | undefined>(undefined);

export const useContactTagsContext = () => {
  const context = useContext(ContactTagsContext);
  if (!context) {
    throw new Error('useContactTagsContext must be used within a ContactTagsProvider');
  }
  return context;
};

interface ContactTagsProviderProps {
  children: ReactNode;
}

export const ContactTagsProvider: React.FC<ContactTagsProviderProps> = ({ children }) => {
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error",
        description: "Failed to load tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tag: Omit<ContactTag, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .insert([tag])
        .select()
        .single();

      if (error) throw error;
      
      setTags(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Tag created successfully.",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('contact_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      toast({
        title: "Success",
        description: "Tag deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const assignTagToContact = async (contactId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('contact_tag_assignments')
        .insert([{ contact_id: contactId, tag_id: tagId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Tag assigned successfully.",
      });
    } catch (error) {
      console.error('Error assigning tag:', error);
      toast({
        title: "Error",
        description: "Failed to assign tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeTagFromContact = async (contactId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('contact_tag_assignments')
        .delete()
        .eq('contact_id', contactId)
        .eq('tag_id', tagId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Tag removed successfully.",
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const value = {
    tags,
    loading,
    createTag,
    deleteTag,
    assignTagToContact,
    removeTagFromContact,
    refetch: fetchTags,
  };

  return (
    <ContactTagsContext.Provider value={value}>
      {children}
    </ContactTagsContext.Provider>
  );
};
