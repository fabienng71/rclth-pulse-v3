
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { SalesForecastForm } from '@/components/procurement/sales-forecast/SalesForecastForm';
import { useAuthStore } from '@/stores/authStore';

const CreateSalesForecastPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Create Sales Forecast
            </h1>
            <p className="text-muted-foreground">
              Create sales forecasts by vendor and item with delivery estimates.
            </p>
          </div>
          
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/procurement/sales-forecasts')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Manage Forecast Sessions
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesForecastForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateSalesForecastPage;
