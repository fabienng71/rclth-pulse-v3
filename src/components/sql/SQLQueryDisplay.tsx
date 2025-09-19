
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface SQLQueryDisplayProps {
  sqlQuery: string;
  onExecute: () => void;
  isExecuting: boolean;
  error: string | null;
}

export const SQLQueryDisplay = ({ sqlQuery, onExecute, isExecuting, error }: SQLQueryDisplayProps) => {
  if (!sqlQuery && !error) return null;

  return (
    <div className="space-y-4">
      {sqlQuery && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Generated SQL Query</label>
            <Button 
              onClick={onExecute} 
              disabled={isExecuting || !sqlQuery.trim()} 
              size="sm"
            >
              {isExecuting ? '🔍 Executing...' : <><Play className="mr-2 h-4 w-4" />Execute Query</>}
            </Button>
          </div>
          
          <div className="relative rounded-md border bg-muted/50 p-4">
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-words max-w-full">
              <code className="language-sql">{sqlQuery}</code>
            </pre>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
