
import React from 'react';
import Navigation from '@/components/Navigation';
import { UniversalBackButton, UniversalBreadcrumb } from '@/components/common/navigation';
import EnhancedClaimForm from '@/components/procurement/claims/EnhancedClaimForm';
import { useEnhancedClaimForm } from '@/components/procurement/claims/useEnhancedClaimForm';

const CreateClaimPage = () => {
  const { handleSubmit, isSubmitting } = useEnhancedClaimForm();

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <UniversalBackButton customPath="/procurement" customLabel="Back to Dashboard" />
          <UniversalBreadcrumb />
          <div className="section-background p-6">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Create Claim</h1>
            <p className="text-muted-foreground text-lg mt-2 mb-0">File a new claim for damaged or incorrect shipment/items</p>
          </div>
        </div>
        <EnhancedClaimForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default CreateClaimPage;
