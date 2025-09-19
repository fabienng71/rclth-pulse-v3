
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { SalesTargetsForm } from '@/components/admin/sales-targets/SalesTargetsForm';
import { useAuthStore } from '@/stores/authStore';

const SalesTargetsManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  if (!isAdmin) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access sales targets management.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/admin/control-center');
  };

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Control Center
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Sales Targets Management</h1>
              <p className="text-muted-foreground">Set and manage monthly sales targets for salespersons</p>
            </div>
          </div>
        </div>

        <SalesTargetsForm 
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />
      </main>
    </div>
  );
};

export default SalesTargetsManagement;
