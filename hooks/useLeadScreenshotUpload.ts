
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { LeadFormValues } from "./useLeadForm";

interface UseLeadScreenshotUploadParams {
  form: UseFormReturn<LeadFormValues>;
  toast: (options: any) => void;
}

export const useLeadScreenshotUpload = ({ form, toast }: UseLeadScreenshotUploadParams) => {
  const handleInstagramScreenshotUpload = async (fileUrl: string) => {
    try {
      toast({
        title: "Processing Image",
        description: "📸 Extracting information from the screenshot...",
        variant: "default"
      });

      const { data, error } = await supabase.functions.invoke('instagram-ocr', {
        body: JSON.stringify({ imageUrl: fileUrl })
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "OCR Processing Failed",
          description: error.message || "Could not process the image. Please try again or fill the form manually.",
          variant: "destructive"
        });
        return;
      }

      console.log('OCR result:', data);

      if (data && !data.error) {
        const {
          customer_name,
          contact_name,
          email,
          phone,
          instagram_handle,
          website,
          notes,
          status,
          screenshot_url
        } = data;

        if (customer_name) form.setValue('customer_name', customer_name);
        if (contact_name) form.setValue('contact_name', contact_name);
        if (email) form.setValue('email', email);
        if (phone) form.setValue('phone', phone);
        if (instagram_handle) form.setValue('instagram_handle', instagram_handle);
        if (website) form.setValue('website', website);
        if (notes) form.setValue('notes', notes);
        if (status) form.setValue('status', status);
        if (screenshot_url) form.setValue('screenshot_url', screenshot_url);

        toast({
          title: "Data Extracted Successfully",
          description: "Please review the extracted information before submitting.",
          variant: "default"
        });
      } else {
        toast({
          title: data.error || "Extraction Failed",
          description: data.details || "Could not extract information. Please fill the form manually.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error processing OCR:', err);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleInstagramScreenshotUpload };
};
