import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';

export interface LeadFormValues {
  customer_name: string;
  contact_name?: string;
  position?: string;
  email?: string;
  phone?: string;
  customer_type_code?: string;
  website?: string;
  instagram_handle?: string;
  screenshot_url?: string;
  notes?: string;
  status: string;
  salesperson_code?: string;
  line_id?: string;
  whatsapp?: string;
}

export const useLeadForm = () => {
  const { id } = useParams();
  const [loadingLead, setLoadingLead] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getBackPath } = useNavigationHistory();
  
  // Initialize form with default values
  const form = useForm<LeadFormValues>({
    defaultValues: {
      customer_name: '',
      contact_name: '',
      position: '',
      email: '',
      phone: '',
      customer_type_code: '',
      website: '',
      instagram_handle: '',
      screenshot_url: '',
      notes: '',
      status: 'New',
      salesperson_code: '',
      line_id: '',
      whatsapp: ''
    }
  });
  
  // Fetch profiles for salesperson assignment
  useEffect(() => {
    const fetchProfiles = async () => {
      setProfilesLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name', { ascending: true });
        
        if (error) throw error;
        setProfiles(data || []);
        setProfilesError(null);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setProfilesError(error.message);
      } finally {
        setProfilesLoading(false);
      }
    };
    
    fetchProfiles();
  }, []);
  
  // Fetch lead data if editing an existing lead
  useEffect(() => {
    const fetchLead = async () => {
      if (id) {
        setLoadingLead(true);
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            // Set form values from fetched data
            form.reset(data);
          }
        } catch (error) {
          console.error('Error fetching lead:', error);
          toast({
            title: "Error",
            description: "Failed to load lead data.",
            variant: "destructive"
          });
        } finally {
          setLoadingLead(false);
        }
      }
    };
    
    fetchLead();
  }, [id, form, toast]);
  
  // Form submission handler
  const onSubmit = async (values: LeadFormValues) => {
    try {
      // Find the selected salesperson's full name
      const selectedProfile = profiles.find(profile => profile.id === values.salesperson_code);
      const fullName = selectedProfile ? selectedProfile.full_name : null;
      
      // Update existing lead
      if (id) {
        const { error } = await supabase
          .from('leads')
          .update({
            customer_name: values.customer_name,
            contact_name: values.contact_name,
            position: values.position,
            email: values.email,
            phone: values.phone,
            customer_type_code: values.customer_type_code,
            website: values.website,
            instagram_handle: values.instagram_handle,
            screenshot_url: values.screenshot_url,
            notes: values.notes,
            status: values.status,
            salesperson_code: values.salesperson_code,
            full_name: fullName, // Save the salesperson's full name
            line_id: values.line_id,
            whatsapp: values.whatsapp
          })
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Lead Updated",
          description: "The lead has been successfully updated.",
        });
      } 
      // Create new lead
      else {
        const { error } = await supabase
          .from('leads')
          .insert([{
            customer_name: values.customer_name,
            contact_name: values.contact_name,
            position: values.position,
            email: values.email,
            phone: values.phone,
            customer_type_code: values.customer_type_code,
            website: values.website,
            instagram_handle: values.instagram_handle,
            screenshot_url: values.screenshot_url,
            notes: values.notes,
            status: values.status,
            salesperson_code: values.salesperson_code,
            full_name: fullName, // Save the salesperson's full name
            line_id: values.line_id,
            whatsapp: values.whatsapp
          }]);
          
        if (error) throw error;
        
        toast({
          title: "Lead Created",
          description: "The lead has been successfully created.",
        });
      }
      
      // Use context-aware navigation or fallback to leads list
      const { path } = getBackPath();
      navigate(path);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save lead.",
        variant: "destructive"
      });
    }
  };
  
  return {
    form,
    loadingLead,
    profiles,
    profilesLoading,
    profilesError,
    onSubmit,
    isEditing: !!id
  };
};
