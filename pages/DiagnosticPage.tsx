
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface DiagnosticInfo {
  jsLoaded: boolean;
  supabaseAccessible: boolean;
  authStoreInitialized: boolean;
  currentUser: any;
  currentRoute: string;
  errors: string[];
  timestamp: string;
}

const DiagnosticPage = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    jsLoaded: true, // If we're here, JS is loaded
    supabaseAccessible: false,
    authStoreInitialized: false,
    currentUser: null,
    currentRoute: window.location.pathname,
    errors: [],
    timestamp: new Date().toISOString()
  });

  const { user, isLoading, isLoggedIn } = useAuthStore();

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('=== DIAGNOSTIC: Running diagnostics ===');
      const errors: string[] = [];
      
      try {
        // Test Supabase connection
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          errors.push(`Supabase auth error: ${error.message}`);
        }
        
        setDiagnostics(prev => ({
          ...prev,
          supabaseAccessible: !error,
          authStoreInitialized: true,
          currentUser: user,
          errors
        }));
      } catch (error) {
        errors.push(`Supabase connection failed: ${error}`);
        setDiagnostics(prev => ({
          ...prev,
          supabaseAccessible: false,
          errors
        }));
      }
    };

    runDiagnostics();
  }, [user]);

  const getStatusBadge = (status: boolean) => (
    <Badge variant={status ? "default" : "destructive"}>
      {status ? "✓ OK" : "✗ FAIL"}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Application Diagnostics</CardTitle>
            <CardDescription>
              System status and troubleshooting information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Core System Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Core System</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>JavaScript Loaded</span>
                    {getStatusBadge(diagnostics.jsLoaded)}
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Supabase Accessible</span>
                    {getStatusBadge(diagnostics.supabaseAccessible)}
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Auth Store Initialized</span>
                    {getStatusBadge(diagnostics.authStoreInitialized)}
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>User Loading</span>
                    <Badge variant={isLoading ? "secondary" : "outline"}>
                      {isLoading ? "LOADING" : "COMPLETE"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Authentication Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Authentication</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Logged In</span>
                    {getStatusBadge(isLoggedIn)}
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>User Email</span>
                    <span className="text-sm">{user?.email || 'Not available'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>User ID</span>
                    <span className="text-sm font-mono">{user?.id || 'Not available'}</span>
                  </div>
                </div>
              </div>

              {/* Environment Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Environment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Current Route</span>
                    <span className="text-sm font-mono">{diagnostics.currentRoute}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Timestamp</span>
                    <span className="text-sm">{new Date(diagnostics.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>User Agent</span>
                    <span className="text-xs truncate max-w-32">{navigator.userAgent.substring(0, 30)}...</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Local Storage</span>
                    {getStatusBadge(typeof Storage !== 'undefined')}
                  </div>
                </div>
              </div>

              {/* Errors */}
              {diagnostics.errors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-destructive">Errors</h3>
                  <div className="space-y-2">
                    {diagnostics.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go to Home
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/login'}>
                  Go to Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                >
                  Clear Storage & Reload
                </Button>
              </div>

              {/* Console Logs */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="mb-2">To troubleshoot further:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open browser developer tools (F12)</li>
                    <li>Check the Console tab for error messages</li>
                    <li>Look for messages starting with "=== " for detailed app flow</li>
                    <li>Check the Network tab for failed API requests</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticPage;
