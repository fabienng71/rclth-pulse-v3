
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { CustomerRequestFormValues } from '@/components/forms/customer/schema';

interface Contact {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  line?: string;
  whatsapp?: string;
}

export const generateCustomerRequestPDF = async (data: CustomerRequestFormValues): Promise<Blob> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 20;

  // Add logo with proper proportions
  await addLogoToPDF(doc);
  yPosition = 50; // Increased to accommodate properly sized logo

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Maintenance Request', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Customer Information Section
  yPosition = addSectionHeader(doc, 'Customer Information', yPosition);
  yPosition = addField(doc, 'Customer Name:', data.customer_name, yPosition);
  yPosition = addField(doc, 'Search Name:', data.search_name || '', yPosition);
  yPosition = addField(doc, 'Address:', data.address || '', yPosition);
  yPosition = addField(doc, 'City:', data.city || '', yPosition);
  yPosition += 5;

  // Company Information Section
  yPosition = addSectionHeader(doc, 'Company Information', yPosition);
  yPosition = addField(doc, 'Company Name:', data.company_name || '', yPosition);
  yPosition = addField(doc, 'Company Address:', data.company_address || '', yPosition);
  yPosition = addField(doc, 'Company City:', data.company_city || '', yPosition);
  yPosition += 5;

  // Classification Section
  yPosition = addSectionHeader(doc, 'Classification', yPosition);
  yPosition = addField(doc, 'Customer Type Code:', data.customer_type_code || '', yPosition);
  
  // Get salesperson name from salesperson code
  const salespersonName = await getSalespersonName(data.salesperson_code);
  yPosition = addField(doc, 'Salesperson:', salespersonName || data.salesperson_code || '', yPosition);
  
  yPosition = addField(doc, 'Customer Group:', data.customer_group || '', yPosition);
  yPosition = addField(doc, 'Region:', data.region || '', yPosition);
  yPosition += 5;

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  // Contacts Section
  yPosition = addSectionHeader(doc, 'Contacts', yPosition);
  if (data.contacts && data.contacts.length > 0) {
    data.contacts.forEach((contact: Contact, index: number) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addField(doc, `Contact ${index + 1} Name:`, contact.name, yPosition);
      yPosition = addField(doc, 'Position:', contact.position || '', yPosition);
      yPosition = addField(doc, 'Phone:', contact.phone || '', yPosition);
      yPosition = addField(doc, 'Email:', contact.email || '', yPosition);
      yPosition = addField(doc, 'LINE ID:', contact.line || '', yPosition);
      yPosition = addField(doc, 'WhatsApp:', contact.whatsapp || '', yPosition);
      yPosition += 3;
    });
  } else {
    yPosition = addField(doc, 'No contacts added', '', yPosition);
  }
  yPosition += 5;

  // Documents Section
  yPosition = addSectionHeader(doc, 'Required Documents', yPosition);
  const docs = data.documents || {};
  yPosition = addField(doc, 'PP20:', docs.pp20 ? 'Yes' : 'No', yPosition);
  yPosition = addField(doc, 'Company Registration:', docs.company_registration ? 'Yes' : 'No', yPosition);
  yPosition = addField(doc, 'ID Card:', docs.id_card ? 'Yes' : 'No', yPosition);
  yPosition += 5;

  // Financial Terms Section
  yPosition = addSectionHeader(doc, 'Financial Terms', yPosition);
  yPosition = addField(doc, 'Credit Limit:', `${data.credit_limit || 0}`, yPosition);
  yPosition = addField(doc, 'Credit Terms:', data.credit_terms || '', yPosition);
  yPosition = addField(doc, 'Prepayment Required:', data.prepayment ? 'Yes' : 'No', yPosition);
  yPosition += 10;

  // Add signature section
  yPosition = addSignatureSection(doc, yPosition, pageHeight);

  return doc.output('blob');
};

const addLogoToPDF = async (doc: jsPDF): Promise<void> => {
  try {
    const { data: files, error } = await supabase.storage
      .from('documents')
      .list('logos', { limit: 10 });

    if (error || !files || files.length === 0) {
      console.error('No logo files found:', error);
      return;
    }

    const logoFile = files.find(file => file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg'));
    
    if (!logoFile) {
      console.error('No suitable logo file found');
      return;
    }

    const { data: logoData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(`logos/${logoFile.name}`);

    if (downloadError || !logoData) {
      console.error('Error downloading logo:', downloadError);
      return;
    }

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(logoData);
    
    await new Promise<void>((resolve) => {
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          try {
            const base64Logo = reader.result.split(',')[1];
            const img = new Image();
            img.onload = function() {
              // Calculate proportional dimensions
              const maxWidth = 50;
              const maxHeight = 25;
              const aspectRatio = img.width / img.height;
              
              let logoWidth = maxWidth;
              let logoHeight = maxWidth / aspectRatio;
              
              // If height exceeds maximum, scale down by height
              if (logoHeight > maxHeight) {
                logoHeight = maxHeight;
                logoWidth = maxHeight * aspectRatio;
              }
              
              doc.addImage(base64Logo, 'PNG', 20, 10, logoWidth, logoHeight);
              resolve();
            };
            img.onerror = () => {
              console.error('Error loading image for sizing');
              resolve();
            };
            img.src = reader.result;
          } catch (imgError) {
            console.error('Error adding image to PDF:', imgError);
            resolve();
          }
        } else {
          resolve();
        }
      };
    });
  } catch (error) {
    console.error('Error processing logo:', error);
  }
};

const getSalespersonName = async (salespersonCode?: string): Promise<string | null> => {
  if (!salespersonCode) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('spp_code', salespersonCode)
      .single();

    if (error || !data) {
      console.error('Error fetching salesperson name:', error);
      return null;
    }

    return data.full_name;
  } catch (error) {
    console.error('Error in getSalespersonName:', error);
    return null;
  }
};

const addSectionHeader = (doc: jsPDF, title: string, yPosition: number): number => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPosition);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  return yPosition + 8;
};

const addField = (doc: jsPDF, label: string, value: string, yPosition: number): number => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(label, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(value, 80, yPosition);
  return yPosition + 6;
};

const addSignatureSection = (doc: jsPDF, yPosition: number, pageHeight: number): number => {
  // Ensure we have enough space for signature section
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Add some space before signature
  yPosition += 10;

  // Signature section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Approval', 20, yPosition);
  yPosition += 10;

  // Signature line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized by:', 20, yPosition);
  doc.text('Fabien or Umberto', 60, yPosition);
  yPosition += 8;

  // Signature line
  doc.line(20, yPosition, 100, yPosition);
  doc.text('signature', 20, yPosition + 5);
  yPosition += 15;

  // Date line
  doc.text('Date: _______________', 20, yPosition);
  yPosition += 10;

  // Footer
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${currentDate}`, 20, pageHeight - 10);

  return yPosition;
};
