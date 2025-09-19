
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: 'standard' | 'admin';
  highlighted?: boolean;
  comingSoon?: boolean;
  disabled?: boolean;
}

const ReportCard = ({
  title,
  description,
  icon,
  onClick,
  variant = 'standard',
  highlighted = false,
  comingSoon = false,
  disabled = false
}: ReportCardProps) => {
  // Color schemes based on variant
  const colorScheme = {
    standard: {
      iconBg: 'bg-background-accent',
      iconCircle: 'bg-card',
      border: highlighted ? 'border-primary/30' : 'border-border',
      buttonColor: highlighted ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : '',
      shadow: highlighted ? 'shadow-md' : ''
    },
    admin: {
      iconBg: 'bg-background-tertiary',
      iconCircle: 'bg-card',
      border: 'border-primary/20',
      buttonColor: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      shadow: ''
    }
  };

  const scheme = colorScheme[variant];

  return (
    <Card className={`overflow-hidden h-full ${scheme.border} ${scheme.shadow} hover:shadow-sm transition-all`}>
      <div className="flex flex-col h-full">
        <div className={`${scheme.iconBg} p-3 flex justify-center`}>
          <div className={`rounded-full ${scheme.iconCircle} p-2`}>
            {icon}
          </div>
        </div>
        
        <CardContent className="pt-3 pb-3 flex flex-col justify-between flex-grow">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {title}
              {comingSoon && (
                <span className="text-xs bg-soft-blue text-primary px-1.5 py-0.5 rounded font-normal text-[10px]">
                  Soon
                </span>
              )}
              {highlighted && (
                <span className="text-xs bg-soft-green text-primary px-1.5 py-0.5 rounded font-normal text-[10px]">
                  New
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          
          <Button 
            variant={variant === 'admin' || highlighted ? "default" : "outline"}
            size="sm"
            className={`w-full mt-3 ${
              variant === 'admin' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 
              (highlighted ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : '')
            }`}
            onClick={onClick}
            disabled={comingSoon || disabled}
          >
            {comingSoon ? "Coming Soon" : disabled ? "Not Available" : "View Report"}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};

export default ReportCard;
