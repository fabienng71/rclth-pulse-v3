
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPipelineStageColor = (stage: string) => {
  switch (stage?.toLowerCase()) {
    case 'lead': return 'bg-purple-100 text-purple-800';
    case 'qualified': return 'bg-blue-100 text-blue-800';
    case 'proposal': return 'bg-orange-100 text-orange-800';
    case 'negotiation': return 'bg-yellow-100 text-yellow-800';
    case 'closed_won': return 'bg-green-100 text-green-800';
    case 'closed_lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
