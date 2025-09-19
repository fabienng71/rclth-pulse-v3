
import React, { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'section' | 'panel';
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className = '',
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'section':
        return 'section-background border border-border/30';
      case 'panel':
        return 'panel-background border border-border/20';
      default:
        return 'bg-background-gradient';
    }
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${getVariantClasses()} ${className}`}>
      {children}
    </div>
  );
};
