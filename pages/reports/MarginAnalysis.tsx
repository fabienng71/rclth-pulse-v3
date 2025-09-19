
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import MarginAnalysisPage from '@/components/reports/margin-analysis/MarginAnalysisPage';
import Navigation from '@/components/Navigation';

const MarginAnalysis = () => {
  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <PageLayout>
        <MarginAnalysisPage />
      </PageLayout>
    </div>
  );
};

export default MarginAnalysis;
