
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { SavedAnalysis } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedAnalysesListProps {
  customerCode: string;
  onRefresh?: () => void;
}

export const SavedAnalysesList = ({ customerCode, onRefresh }: SavedAnalysesListProps) => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (customerCode) {
      fetchSavedAnalyses();
    }
  }, [customerCode]);

  const fetchSavedAnalyses = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('customer_code', customerCode)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSavedAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching saved analyses:', error);
      toast.error('Failed to load saved analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAnalysisAsTxt = (analysis: string, dateStr: string) => {
    const element = document.createElement('a');
    const file = new Blob([analysis], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${customerCode}-analysis-${dateStr}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('ai_analysis')
        .delete()
        .eq('id', deleteId);
        
      if (error) throw error;
      
      setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== deleteId));
      toast.success('Analysis deleted');
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedAnalyses.length > 0 ? (
        savedAnalyses.map((analysis) => (
          <Card key={analysis.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">Analysis from {format(new Date(analysis.created_at), 'PP')}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => downloadAnalysisAsTxt(analysis.ai_analysis, format(new Date(analysis.created_at), 'yyyy-MM-dd'))}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDeleteId(analysis.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              {analysis.date_range && (
                <p className="text-sm text-muted-foreground">Period: {analysis.date_range}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm">{analysis.ai_analysis}</div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No saved analyses found for this customer
        </div>
      )}
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this analysis? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
