
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface ForecastActionsProps {
  onBack: () => void;
  onSave: () => void;
  loading: boolean;
}

const ForecastActions: React.FC<ForecastActionsProps> = ({ onBack, onSave, loading }) => {
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Setup
      </Button>
      <Button onClick={onSave} disabled={loading}>
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Saving...' : 'Save Forecast'}
      </Button>
    </div>
  );
};

export default ForecastActions;
