import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';

interface UniversalBackButtonProps {
  className?: string;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  customPath?: string;
  customLabel?: string;
}

const UniversalBackButton: React.FC<UniversalBackButtonProps> = ({
  className = "mb-2",
  variant = "ghost",
  size = "default",
  customPath,
  customLabel
}) => {
  const navigate = useNavigate();
  const { getBackPath, goBack } = useNavigationHistory();

  const handleClick = () => {
    if (customPath) {
      // Use custom navigation if provided
      navigate(customPath);
    } else {
      // Use context-aware navigation
      goBack();
    }
  };

  const { label } = customPath ? { label: customLabel || 'Back' } : getBackPath();

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default UniversalBackButton;