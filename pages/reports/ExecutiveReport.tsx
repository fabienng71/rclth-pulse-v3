
import React from 'react';
import Navigation from '@/components/Navigation';
import { ShortBusinessReport } from '@/components/reports/short-business/ShortBusinessReport';

const ExecutiveReport = () => {
  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Executive Dashboard</h1>
        </div>
        
        {/* Short Business Report */}
        <ShortBusinessReport />
      </main>
    </div>
  );
};

export default ExecutiveReport;
