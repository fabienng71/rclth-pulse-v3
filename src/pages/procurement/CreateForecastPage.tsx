
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import ForecastCreationForm from '@/components/procurement/forecast/ForecastCreationForm';
import { useNavigate } from 'react-router-dom';

const CreateForecastPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/procurement');
  };

  const handleCancel = () => {
    navigate('/procurement');
  };

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <ForecastCreationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateForecastPage;
