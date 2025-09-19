
import React from 'react';
import { Button } from '@/components/ui/button';

interface ReturnFormSubmitProps {
  isSubmitting: boolean;
}

export const ReturnFormSubmit: React.FC<ReturnFormSubmitProps> = ({ isSubmitting }) => {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? '📝 Submitting...' : 'Submit Return Request'}
    </Button>
  );
};
