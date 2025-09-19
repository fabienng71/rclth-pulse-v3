import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemsHeader } from '@/components/admin/items/ItemsHeader';

interface ItemsManagementHeaderProps {
  onCreateClick: () => void;
  onUploadClick: () => void;
  onSyncClick: () => void;
}

export const ItemsManagementHeader: React.FC<ItemsManagementHeaderProps> = ({
  onCreateClick,
  onUploadClick,
  onSyncClick
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button 
        onClick={() => navigate('/admin/control-center')} 
        variant="ghost" 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Control Center
      </Button>
      
      <ItemsHeader 
        onCreateClick={onCreateClick}
        onUploadClick={onUploadClick}
        onSyncClick={onSyncClick}
      />
    </div>
  );
};