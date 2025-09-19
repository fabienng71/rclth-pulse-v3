
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebugDatabase } from '@/hooks/useDebugDatabase';
import { Bug, Database, Shield, AlertTriangle } from 'lucide-react';

export const DatabaseDebugPanel: React.FC = () => {
  const { debugging, runDatabaseDiagnostics, testDirectSQLInsertion } = useDebugDatabase();

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bug className="h-5 w-5" />
          Database Debug Panel
          <Badge variant="outline" className="text-orange-600">
            Development Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <strong>Debug Information</strong>
          </div>
          <p>This panel helps diagnose forecast session creation issues. Check the browser console for detailed logs.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={runDatabaseDiagnostics}
            disabled={debugging}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {debugging ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </Button>
          
          <Button
            onClick={testDirectSQLInsertion}
            disabled={debugging}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Test SQL Insertion
          </Button>
        </div>
        
        <div className="text-xs text-orange-600">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Open browser console (F12)</li>
            <li>Click "Run Full Diagnostics"</li>
            <li>Review the console output for errors</li>
            <li>Try creating a session again</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
