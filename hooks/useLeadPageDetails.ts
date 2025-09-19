
import { useLocation, useParams } from "react-router-dom";

interface UseLeadPageDetailsParams {
  isViewMode: boolean;
  isEditing: boolean;
  uploadMode: boolean;
}

export const useLeadPageDetails = ({ isViewMode, isEditing, uploadMode }: UseLeadPageDetailsParams) => {
  const getPageTitle = () => {
    if (isViewMode) return "Lead Details";
    if (isEditing) return "Edit Lead";
    if (uploadMode) return "Upload Lead";
    return "Create New Lead";
  };

  const getPageDescription = () => {
    if (isViewMode) return "View and manage lead information";
    if (isEditing) return "Update lead information";
    if (uploadMode) return "Upload documents to automatically extract lead information";
    return "Add a new lead to your pipeline";
  };

  return {
    pageTitle: getPageTitle(),
    pageDescription: getPageDescription(),
  };
};
