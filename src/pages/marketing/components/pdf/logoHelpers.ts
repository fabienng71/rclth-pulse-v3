
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the company logo from Supabase storage and adds it to the PDF
 * @param doc The jsPDF document instance
 * @returns Promise that resolves when the logo is added or fails
 */
export const addLogoToPdf = async (doc: jsPDF): Promise<void> => {
  try {
    // Fetch the logo from Supabase with the correct path
    const { data: logoData, error: logoError } = await supabase.storage
      .from("documents")
      .download("logos/1743983989255-RCL_TH_Colour.png");

    if (logoError) {
      console.error("Error fetching logo:", logoError);
      return;
    } 
    
    if (!logoData) {
      console.error("No logo data returned from Supabase");
      return;
    }

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(logoData);
    
    // Wait for the reader to finish
    await new Promise<void>((resolve) => {
      reader.onloadend = () => {
        // Add logo to PDF (if available)
        if (reader.result && typeof reader.result === 'string') {
          const base64Logo = reader.result.split(",")[1];
          try {
            doc.addImage(base64Logo, "PNG", 14, 10, 40, 15); // Adjust size and position as needed
            console.log("Logo added successfully to PDF");
          } catch (imgError) {
            console.error("Error adding image to PDF:", imgError);
          }
        } else {
          console.error("Reader result is not a string or is null");
        }
        resolve();
      };
    });
  } catch (error) {
    console.error("Error processing logo:", error);
  }
};
