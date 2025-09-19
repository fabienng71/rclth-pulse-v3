
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tag, FileText } from "lucide-react";
import Navigation from '@/components/Navigation';

const MarketingCard = ({ 
  title, 
  description, 
  icon: Icon,
  onClick
}: { 
  title: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
}) => (
  <Card className="h-full cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <CardHeader className="flex flex-row items-center gap-2">
      <div className="bg-primary/10 p-2 rounded-md">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      {/* Card content */}
    </CardContent>
  </Card>
);

const Marketing = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="app-background">
      <Navigation />
      <div className="bg-background-container border border-border/20 rounded-lg mx-4 my-6">
        <div className="container py-6 flex-1">
          <div className="space-y-1 mb-8">
            <h1 className="text-3xl font-semibold">Marketing</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Plan, execute, and monitor your marketing campaigns in one place.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <MarketingCard 
              title="Price List"
              description="Manage and update product pricing"
              icon={Tag}
              onClick={() => handleCardClick('/marketing/price-list')}
            />
            <MarketingCard 
              title="Documents"
              description="Organize marketing collateral"
              icon={FileText}
              onClick={() => handleCardClick('/marketing/documents')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
