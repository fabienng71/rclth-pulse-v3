
import React from 'react';
import type { ForecastResult } from '@/types/forecast';
import type { ForecastFormData } from './form/forecastFormSchema';
import ForecastSummary from './ForecastSummary';
import ForecastSummaryCard from './components/ForecastSummaryCard';
import ForecastResultsTable from './components/ForecastResultsTable';
import ForecastActions from './components/ForecastActions';

interface ForecastPreviewProps {
  results: ForecastResult[];
  formData: ForecastFormData;
  onBack: () => void;
  onSave: () => void;
  loading: boolean;
}

const ForecastPreview: React.FC<ForecastPreviewProps> = ({
  results,
  formData,
  onBack,
  onSave,
  loading
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <ForecastSummaryCard results={results} formData={formData} />

      {/* Results Table */}
      <ForecastResultsTable results={results} />

      {/* Forecast Summary */}
      <ForecastSummary results={results} formData={formData} />

      {/* Actions */}
      <ForecastActions onBack={onBack} onSave={onSave} loading={loading} />
    </div>
  );
};

export default ForecastPreview;
