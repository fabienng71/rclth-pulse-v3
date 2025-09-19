
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface FormCardProps {
  title: string;
  description: string;
  viewPath: string;
  createPath: string;
  isPrimary?: boolean;
  viewLabel?: string;
  createLabel?: string;
  ViewIcon: LucideIcon;
  CreateIcon: LucideIcon;
  isLeaveBlue?: boolean; // optional prop for leave-specific styling
  isCustomer?: boolean; // new optional prop for customer-specific styling
  isNew?: boolean;
}

const FormCard = ({
  title,
  description,
  viewPath,
  createPath,
  isPrimary = false,
  viewLabel = 'View',
  createLabel = 'Create',
  ViewIcon,
  CreateIcon,
  isLeaveBlue = false,
  isCustomer = false,
  isNew = false,
}: FormCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className={`overflow-hidden border ${
      isLeaveBlue ? 'border-blue-600' : 
      isCustomer ? 'border-green-600' :
      (isPrimary ? 'border-primary' : 'border-input')
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {isNew && <Badge variant="outline">New</Badge>}
        </div>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-left py-6" 
            onClick={() => navigate(viewPath)}
          >
            <ViewIcon className="mr-2 h-5 w-5" />
            {viewLabel}
          </Button>
          <Button 
            className={`w-full justify-start text-left py-6 ${
              isLeaveBlue ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
              isCustomer ? 'bg-green-600 hover:bg-green-700 text-white' :
              (isPrimary ? 'bg-primary hover:bg-primary/90' : 'bg-red-600 hover:bg-red-700')
            }`}
            onClick={() => navigate(createPath)}
          >
            <CreateIcon className="mr-2 h-5 w-5" />
            {createLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormCard;
