
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Contact } from '@/hooks/useOptimizedContactsData';

interface ContactsHeaderProps {
  selectedContacts: Contact[];
  onExport?: () => void;
  onImport?: () => void;
}

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  selectedContacts,
  onExport,
  onImport
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Contacts
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your customer contacts and relationships
          {selectedContacts.length > 0 && (
            <span className="ml-2 text-primary font-medium">
              ({selectedContacts.length} selected)
            </span>
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {onImport && (
          <Button variant="outline" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        
        {onExport && selectedContacts.length > 0 && (
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export ({selectedContacts.length})
          </Button>
        )}
        
        <Link to="/crm/contacts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </Link>
      </div>
    </div>
  );
};
