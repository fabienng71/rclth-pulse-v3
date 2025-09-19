
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, FileText, Save } from 'lucide-react';

interface Props {
  status: string;
  onSaveDraft: () => void;
  onSendEmail: () => void;
  onGeneratePdf: () => void;
  isSubmitting: boolean;
}

const ClaimActionsSection: React.FC<Props> = ({
  status, onSaveDraft, onSendEmail, onGeneratePdf, isSubmitting
}) => (
  <div className="flex gap-3 justify-end pt-3 border-t mt-8">
    <Button variant="outline" type="button" onClick={onSaveDraft} disabled={isSubmitting}>
      <Save className="mr-1" /> Save Draft
    </Button>
    <Button variant="outline" type="button" onClick={onGeneratePdf} disabled={isSubmitting}>
      <FileText className="mr-1" /> Generate PDF
    </Button>
    <Button variant="default" type="button" onClick={onSendEmail} disabled={isSubmitting}>
      {isSubmitting ? <Loader2 className="animate-spin mr-1" /> : <Send className="mr-1" />}
      Send by Email
    </Button>
  </div>
);

export default ClaimActionsSection;
