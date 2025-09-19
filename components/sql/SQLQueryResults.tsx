
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import NLToSQLResult from './NLToSQLResult';

interface SQLQueryResultsProps {
  results: any[] | null;
  columns: string[];
}

export const SQLQueryResults = ({ results, columns }: SQLQueryResultsProps) => {
  if (!results) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Results</CardTitle>
        <CardDescription>
          {results.length} records found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4">
            <NLToSQLResult results={results} columns={columns} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
