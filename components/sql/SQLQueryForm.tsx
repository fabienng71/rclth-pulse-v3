
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Database, FileText } from 'lucide-react';

interface SQLQueryFormProps {
  naturalLanguageQuery: string;
  onNaturalLanguageQueryChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const SQLQueryForm = ({ 
  naturalLanguageQuery, 
  onNaturalLanguageQueryChange, 
  onGenerate, 
  isGenerating 
}: SQLQueryFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Natural Language to SQL
        </CardTitle>
        <CardDescription>
          Enter a description of what you want to query and we'll generate SQL for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="nl-query" className="text-sm font-medium">
            Describe your query in plain English
          </label>
          <Textarea
            id="nl-query"
            placeholder="Example: Show me the top 10 customers by sales amount for last month"
            className="min-h-[100px] font-medium"
            value={naturalLanguageQuery}
            onChange={(e) => onNaturalLanguageQueryChange(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating || !naturalLanguageQuery.trim()}
          className="w-full"
        >
          {isGenerating ? '⚙️ Generating SQL...' : <><FileText className="mr-2 h-4 w-4" />Generate SQL Query</>}
        </Button>
      </CardContent>
    </Card>
  );
};
