
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { LeadFormValues } from "./useLeadForm";

interface UseLeadPrefillParams {
  form: UseFormReturn<LeadFormValues>;
  isEditing: boolean;
  isViewMode: boolean;
  toast: (options: any) => void;
}

export const useLeadPrefill = ({ form, isEditing, isViewMode, toast }: UseLeadPrefillParams) => {
  const location = useLocation();

  useEffect(() => {
    // Only prefill on mount (not in edit/view modes)
    if (location.state?.prefill && !isEditing && !isViewMode) {
      const prefill = location.state.prefill;
      // DEBUG: log what we receive from navigation
      console.log("Received prefill data in CreateLead:", prefill);

      // Map prefill fields to the CRM fields if necessary
      const mapped = {
        customer_name: prefill.company_name || "",
        contact_name: prefill.contact_person || "",
        email: prefill.email || "",
        phone: prefill.phone || "",
        website: prefill.website || "",
        instagram_handle: prefill.instagram_handle || "",
        notes: prefill.notes || "",
        status: "New",
      };
      // DEBUG: log what is actually used to prefill
      console.log("Mapped values for form.reset:", mapped);

      // Prefill form values
      form.reset({
        ...form.getValues(),
        ...mapped,
      });
      // Show a notification
      toast({
        title: "Fields filled from Research",
        description: "The form is pre-populated with research results.",
        variant: "default",
      });
    }
     
  }, [location.state?.prefill, isEditing, isViewMode, form, toast]); 
};
