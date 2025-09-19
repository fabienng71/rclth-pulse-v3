import React from 'react';
import { Button } from '@/components/ui/button';

interface DebuggerTriggerProps {
  onOpen: () => void;
}

export const DebuggerTrigger: React.FC<DebuggerTriggerProps> = ({ onOpen }) => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button 
        onClick={onOpen}
        variant="outline"
        size="sm"
        className="bg-red-500 text-white hover:bg-red-600"
      >
        🔬 Advanced Debug
      </Button>
    </div>
  );
};