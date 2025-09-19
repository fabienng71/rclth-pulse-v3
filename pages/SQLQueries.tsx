
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSQLQueries } from '../hooks/useSQLQueries';
import { SQLQueryForm } from '../components/sql/SQLQueryForm';
import { SQLQueryDisplay } from '../components/sql/SQLQueryDisplay';
import { SQLQueryResults } from '../components/sql/SQLQueryResults';

const SQLQueries = () => {
  const navigate = useNavigate();
  const {
    naturalLanguageQuery,
    setNaturalLanguageQuery,
    sqlQuery,
    isGenerating,
    isExecuting,
    results,
    error,
    columns,
    handleGenerate,
    handleExecute
  } = useSQLQueries();

  return (
    <>
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold">SQL Queries</h1>
        </div>
        
        <div className="grid gap-6">
          <SQLQueryForm
            naturalLanguageQuery={naturalLanguageQuery}
            onNaturalLanguageQueryChange={setNaturalLanguageQuery}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <SQLQueryDisplay
            sqlQuery={sqlQuery}
            onExecute={handleExecute}
            isExecuting={isExecuting}
            error={error}
          />

          <SQLQueryResults
            results={results}
            columns={columns}
          />
        </div>
      </main>
    </>
  );
};

export default SQLQueries;
