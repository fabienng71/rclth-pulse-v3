
import { Button } from "@/components/ui/button";

interface LeadFormActionsProps {
  isSubmitting: boolean;
  isEditing: boolean;
  loadingLead: boolean;
  onCancel: () => void;
}

export const LeadFormActions = ({ 
  isSubmitting, 
  isEditing, 
  loadingLead, 
  onCancel 
}: LeadFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting || loadingLead}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || loadingLead}
      >
        {isSubmitting ? 
          (isEditing ? "Saving Lead..." : "Creating Lead...") : 
          (isEditing ? "Save Changes" : "Create Lead")}
      </Button>
    </div>
  );
};
