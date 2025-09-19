
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { fetchForecastById } from '@/services/forecastService';
import { toast } from 'sonner';
import ForecastSummaryCard from '@/components/procurement/forecast/components/ForecastSummaryCard';
import ForecastResultsTable from '@/components/procurement/forecast/components/ForecastResultsTable';
import ForecastSummary from '@/components/procurement/forecast/ForecastSummary';
import type { ForecastResult } from '@/types/forecast';
import type { ForecastFormData } from '@/components/procurement/forecast/form/forecastFormSchema';

const ForecastDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [formData, setFormData] = useState<ForecastFormData | null>(null);
  const [forecastTitle, setForecastTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForecast = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await fetchForecastById(id);
        
        // Reconstruct the form data from forecast and parameters
        const shippingTimeParam = data.parameters.find(p => p.parameter_name === 'shipping_time_days');
        const targetStockDaysParam = data.parameters.find(p => p.parameter_name === 'target_stock_days');
        const selectedItemsParam = data.parameters.find(p => p.parameter_name === 'selected_items');

        const reconstructedFormData: ForecastFormData = {
          title: data.forecast.title,
          description: data.forecast.description || '',
          forecast_method: data.forecast.forecast_method,
          time_period_months: data.forecast.time_period_months,
          confidence_threshold: data.forecast.confidence_threshold,
          lead_time_days: data.forecast.lead_time_days,
          shipping_time_days: shippingTimeParam ? parseInt(shippingTimeParam.parameter_value) : 7,
          target_stock_days: targetStockDaysParam ? parseInt(targetStockDaysParam.parameter_value) : 30,
          selectedItems: selectedItemsParam ? JSON.parse(selectedItemsParam.parameter_value) : []
        };

        setForecastResults(data.forecastResults || []);
        setFormData(reconstructedFormData);
        setForecastTitle(data.forecast.title);
      } catch (error) {
        toast.error('Failed to load forecast');
        navigate('/procurement/forecasts');
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">Loading forecast...</div>
        </div>
      </div>
    );
  }

  if (!formData || !forecastResults.length) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">Forecast not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/procurement/forecasts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forecasts
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>Viewing Saved Forecast</span>
          </div>
        </div>

        <div className="mb-6 section-background p-6">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">{forecastTitle}</h1>
          <p className="text-muted-foreground text-xl">Detailed forecast analysis and projections</p>
        </div>

        {/* Use the same components as forecast creation preview */}
        <div className="space-y-6">
          {/* Summary Card */}
          <ForecastSummaryCard results={forecastResults} formData={formData} />

          {/* Results Table */}
          <ForecastResultsTable results={forecastResults} />

          {/* Forecast Summary */}
          <ForecastSummary results={forecastResults} formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default ForecastDetailPage;
