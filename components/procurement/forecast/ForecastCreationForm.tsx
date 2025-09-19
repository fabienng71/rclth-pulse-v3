
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForecastGeneration } from '@/hooks/useForecastGeneration';
import { useForecastSave } from '@/hooks/useForecastSave';
import { forecastFormSchema, type ForecastFormData } from './form/forecastFormSchema';
import type { ForecastResult } from '@/types/forecast';
import BasicInfoSection from './form/BasicInfoSection';
import ParametersSection from './form/ParametersSection';
import ItemSelectionSection from './ItemSelectionSection';
import FormActions from './form/FormActions';
import ForecastPreview from './ForecastPreview';

interface ForecastCreationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ForecastCreationForm: React.FC<ForecastCreationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form');
  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [formData, setFormData] = useState<ForecastFormData | null>(null);

  const form = useForm<ForecastFormData>({
    resolver: zodResolver(forecastFormSchema),
    defaultValues: {
      title: '',
      description: '',
      forecast_method: 'moving_average',
      time_period_months: 6,
      confidence_threshold: 0.8,
      lead_time_days: 30,
      shipping_time_days: 7,
      target_stock_days: 30,
      selectedItems: []
    }
  });

  const { generateForecast, loading: generating } = useForecastGeneration();
  const { handleSave, saving } = useForecastSave();

  const onSubmit = async (data: ForecastFormData) => {
    try {
      // At this point, data is already validated by Zod and is of type ForecastFormData
      const results = await generateForecast(data);
      setForecastResults(results);
      setFormData(data);
      setCurrentStep('preview');
      toast.success('Forecast generated successfully!');
    } catch (error) {
      toast.error('Failed to generate forecast');
      console.error('Forecast generation error:', error);
    }
  };

  const handleSaveForecast = async () => {
    if (!formData || !forecastResults.length) return;

    try {
      await handleSave(formData, forecastResults);
      toast.success('Forecast saved successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save forecast');
      console.error('Forecast save error:', error);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  if (currentStep === 'preview' && formData) {
    return (
      <ForecastPreview
        results={forecastResults}
        formData={formData}
        onBack={handleBackToForm}
        onSave={handleSaveForecast}
        loading={saving}
      />
    );
  }

  // Get current form values for display purposes
  const selectedItems = form.watch('selectedItems') || [];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Create Demand Forecast</h1>
        <p className="text-muted-foreground text-xl">Generate intelligent demand forecasts for inventory planning</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BasicInfoSection form={form} />
              <ParametersSection form={form} />
              <ItemSelectionSection 
                selectedItems={selectedItems}
                onSelectionChange={(items) => form.setValue('selectedItems', items)}
              />
              <FormActions
                onCancel={onCancel}
                loading={generating}
                selectedItemsCount={selectedItems.length}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ForecastCreationForm;
