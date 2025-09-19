
// Export types
export type { CustomerRequest, CustomerRequestDocument, ServiceResponse, ServiceResult } from './types';

// Export core customer request functions
export {
  createCustomerRequest,
  fetchUserCustomerRequests,
  fetchCustomerRequestById,
  updateCustomerRequest,
  deleteCustomerRequest,
} from './customerRequestCore';

// Export status management functions
export { updateRequestStatus } from './statusService';

// Export document management functions
export {
  uploadCustomerRequestDocument,
  fetchCustomerRequestDocuments,
  deleteCustomerRequestDocument,
  getDocumentUrl,
} from './documentService';

// Export email functions
export { sendCustomerRequestEmail } from './emailService';

// Export PDF generation functions
export { generateCustomerRequestPDF } from './pdfService';
