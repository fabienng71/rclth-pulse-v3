
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { UniversalBackButton, UniversalBreadcrumb } from '@/components/common/navigation';
import { useForecasts } from '@/hooks/useForecasts';
import { toast } from 'sonner';

const ForecastListPage = () => {
  const navigate = useNavigate();
  const { forecasts, loading, deleteForecast } = useForecasts();

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteForecast(id);
        toast.success('Forecast deleted successfully');
      } catch (error) {
        toast.error('Failed to delete forecast');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">Loading forecasts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <UniversalBackButton customPath="/procurement" customLabel="Back to Dashboard" />
          <UniversalBreadcrumb />
          <div className="flex justify-between items-center">
            <div className="section-background p-6 flex-1 mr-4">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Demand Forecasts</h1>
              <p className="text-muted-foreground text-xl">View and manage your saved forecasts</p>
            </div>
            <Button onClick={() => navigate('/procurement/forecast/create')}>
              <Plus className="h-4 w-4 mr-2" />
              New Forecast
            </Button>
          </div>
        </div>

        <Card variant="enhanced">
          <CardHeader>
            <CardTitle>Saved Forecasts</CardTitle>
          </CardHeader>
          <CardContent>
            {forecasts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No forecasts found</p>
                <Button onClick={() => navigate('/procurement/forecast/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Forecast
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecasts.map((forecast) => (
                    <TableRow key={forecast.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{forecast.title}</div>
                          {forecast.description && (
                            <div className="text-sm text-muted-foreground">
                              {forecast.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {forecast.forecast_method.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{forecast.time_period_months} months</TableCell>
                      <TableCell>{getStatusBadge(forecast.status)}</TableCell>
                      <TableCell>{formatDate(forecast.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/procurement/forecasts/${forecast.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(forecast.id, forecast.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForecastListPage;
