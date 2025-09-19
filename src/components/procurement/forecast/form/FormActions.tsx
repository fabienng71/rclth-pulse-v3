
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  loading: boolean;
  selectedItemsCount: number;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  loading, 
  selectedItemsCount 
}) => {
  return (
    <div className="flex justify-between pt-6 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading || selectedItemsCount === 0}>
        {loading ? 'Generating...' : 'Generate Forecast'}
      </Button>
    </div>
  );
};

export default FormActions;
