
import React from 'react';
import { TopNSelector } from '../TopNSelector';

interface TopNSelectorWrapperProps {
  activeTab: string;
  topN: number;
  onTopNChange: (value: number) => void;
}

export const TopNSelectorWrapper = ({ activeTab, topN, onTopNChange }: TopNSelectorWrapperProps) => {
  // Only show TopN selector for items and customers tabs
  if (activeTab === 'items' || activeTab === 'customers') {
    return (
      <div className="flex justify-end mb-4">
        <TopNSelector value={topN} onChange={onTopNChange} />
      </div>
    );
  }
  
  return null;
};
