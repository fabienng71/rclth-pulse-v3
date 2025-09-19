
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { contactFormSchema, type ContactFormValues } from "./schema";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";

export const useContactForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { getBackPath } = useNavigationHistory();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      account: "",
      position: "",
      email: "",
      telephone: "",
      whatsapp: "",
      line_id: "",
      region: "",
      customer_code: "",
      customer_name: "",
      search_name: "",
      salesperson: "",
    },
  });

  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch contact details",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        // Convert any null values to empty strings to avoid validation errors
        const formattedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, value === null ? "" : value])
        );
        
        form.reset(formattedData as ContactFormValues);
      }
    };

    fetchContact();
  }, [id, form, toast]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      if (id) {
        const { error } = await supabase
          .from("contacts")
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert([data]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact has been created successfully",
        });
      }
      
      // Use context-aware navigation or fallback to contacts list
      const { path } = getBackPath();
      navigate(path);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
    isEditing: !!id
  };
};
