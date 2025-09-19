import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { CogsManagement } from '@/components/admin/CogsManagement';

const CogsManagementPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  if (!isAdmin) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access COGS management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/control-center')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Control Center
          </Button>
        </div>
        
        <CogsManagement />
      </div>
    </div>
  );
};

export default CogsManagementPage;