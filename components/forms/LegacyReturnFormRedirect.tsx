/**
 * Component that redirects legacy return form routes to the enhanced form
 * with appropriate deprecation warnings and migration handling
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface LegacyReturnFormRedirectProps {
  title: string;
  description: string;
  redirectTo: string;
}

const LegacyReturnFormRedirect: React.FC<LegacyReturnFormRedirectProps> = ({
  title,
  description,
  redirectTo
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.warn(`⚠️ DEPRECATED: ${title} has been deprecated. Redirecting to enhanced form.`);
  }, [title]);

  const handleRedirect = () => {
    navigate(redirectTo);
  };

  const handleAutoRedirect = () => {
    setTimeout(() => {
      navigate(redirectTo);
    }, 3000);
  };

  React.useEffect(() => {
    handleAutoRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {title} - Deprecated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {description} has been deprecated in favor of our enhanced multi-item return request form.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You will be automatically redirected to the enhanced form in 3 seconds, or you can click the button below to continue immediately.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleRedirect}
                className="flex items-center gap-2"
              >
                Continue to Enhanced Form
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/forms')}
              >
                Back to Forms
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Enhanced Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Multiple items per return request</li>
              <li>• Step-by-step wizard interface</li>
              <li>• Auto-save functionality</li>
              <li>• Improved validation and error handling</li>
              <li>• Better customer and item selection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegacyReturnFormRedirect;