
import { Contact } from "@/hooks/useContactsData";

export const exportContactsToCSV = (contacts: Contact[]) => {
  if (contacts.length === 0) {
    console.warn('No contacts to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'First Name',
    'Last Name', 
    'Account',
    'Position',
    'Email',
    'Telephone',
    'WhatsApp',
    'LINE ID',
    'Region',
    'Salesperson',
    'Customer Code',
    'Customer Name'
  ];

  // Convert contacts to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...contacts.map(contact => [
      `"${contact.first_name || ''}"`,
      `"${contact.last_name || ''}"`,
      `"${contact.account || ''}"`,
      `"${contact.position || ''}"`,
      `"${contact.email || ''}"`,
      `"${contact.telephone || ''}"`,
      `"${contact.whatsapp || ''}"`,
      `"${contact.line_id || ''}"`,
      `"${contact.region || ''}"`,
      `"${contact.salesperson || ''}"`,
      `"${contact.customer_code || ''}"`,
      `"${contact.customer_name || ''}"`,
    ].join(','))
  ];

  // Create CSV content
  const csvContent = csvRows.join('\n');

  // Create and download file with UTF-8 BOM for proper character encoding
  const utf8BOM = '\uFEFF';
  const blob = new Blob([utf8BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
