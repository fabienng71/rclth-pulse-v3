import React from 'react';
import { Button } from '@/components/ui/button';

interface DebuggerActionsProps {
  onRunDiagnosis: () => void;
  onRunCrossBrowserTest: () => void;
  onDownloadResults: () => void;
  onClose: () => void;
  isRunningTests: boolean;
  hasResults: boolean;
}

export const DebuggerActions: React.FC<DebuggerActionsProps> = ({
  onRunDiagnosis,
  onRunCrossBrowserTest,
  onDownloadResults,
  onClose,
  isRunningTests,
  hasResults
}) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onRunDiagnosis} variant="default" size="sm">
        🔬 Basic Diagnosis
      </Button>
      <Button 
        onClick={onRunCrossBrowserTest} 
        variant="secondary" 
        size="sm"
        disabled={isRunningTests}
      >
        {isRunningTests ? '⏳ Testing...' : '🌐 Cross-Browser Test'}
      </Button>
      {hasResults && (
        <Button onClick={onDownloadResults} variant="outline" size="sm">
          💾 Download Results
        </Button>
      )}
      <Button onClick={onClose} variant="ghost" size="sm">
        ✕ Close
      </Button>
    </div>
  );
};