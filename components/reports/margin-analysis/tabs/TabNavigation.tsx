
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  return (
    <div className="border-b mb-4">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="items">Items</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-1">
          <Brain className="h-4 w-4" />
          <span>AI Insights</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};
