import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CleanFragment } from "@/components/ui/clean-fragment";
import { SortableTableHeader } from "@/components/reports/SortableTableHeader";
import { Contact } from "@/hooks/useContactsData";
import { useNavigate } from "react-router-dom";
import { SortDirection } from "@/hooks/useSortableTable";
import { ContactAvatar } from "./ContactAvatar";
import { ContactExpandedRow } from "./ContactExpandedRow";
import { ContactStatusBadge } from "./ContactStatusBadge";
import { ContactHealthScore } from "./ContactHealthScore";
import { ContactTags } from "./ContactTags";
import { ChevronDown, ChevronRight, Mail, Phone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface ContactsTableProps {
  contacts: Contact[];
  sortField: string;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  selectedContacts?: Contact[];
  onSelectionChange?: (contacts: Contact[]) => void;
  onContactUpdate?: () => void;
  totalFilteredCount?: number;
  onSelectAllFiltered?: () => void;
  isSelectingAllFiltered?: boolean;
}

export const ContactsTable = ({ 
  contacts, 
  sortField, 
  sortDirection, 
  onSort,
  selectedContacts = [],
  onSelectionChange,
  onContactUpdate,
  totalFilteredCount = 0,
  onSelectAllFiltered,
  isSelectingAllFiltered = false
}: ContactsTableProps) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleRowClick = (contactId: string) => {
    navigate(`/crm/contacts/${contactId}`);
  };

  const toggleRowExpansion = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(contactId)) {
      newExpanded.delete(contactId);
    } else {
      newExpanded.add(contactId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSelectContact = (contact: Contact, checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...selectedContacts, contact]);
    } else {
      onSelectionChange(selectedContacts.filter(c => c.id !== contact.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange(contacts);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectAllFiltered = () => {
    if (onSelectAllFiltered) {
      onSelectAllFiltered();
    }
  };

  const isContactSelected = (contact: Contact) => {
    return selectedContacts.some(c => c.id === contact.id);
  };

  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const isIndeterminate = selectedContacts.length > 0 && selectedContacts.length < contacts.length;
  const hasMoreContacts = totalFilteredCount > contacts.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {onSelectionChange && (
              <TableCell className="w-12">
                {hasMoreContacts ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <Checkbox
                          checked={isAllSelected}
                          className={cn(isIndeterminate && "data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground")}
                          style={{
                            background: isIndeterminate ? 'var(--muted)' : undefined,
                            borderColor: isIndeterminate ? 'var(--muted-foreground)' : undefined,
                          }}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72">
                      <DropdownMenuItem onClick={() => handleSelectAll(true)}>
                        Select visible contacts ({contacts.length})
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleSelectAllFiltered}
                        disabled={isSelectingAllFiltered}
                        className="flex items-center gap-2"
                      >
                        {isSelectingAllFiltered && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {isSelectingAllFiltered 
                          ? 'Loading all filtered contacts...' 
                          : `Select all filtered contacts (${totalFilteredCount})`
                        }
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSelectionChange([])}>
                        Clear selection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={cn(isIndeterminate && "data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground")}
                    style={{
                      background: isIndeterminate ? 'var(--muted)' : undefined,
                      borderColor: isIndeterminate ? 'var(--muted-foreground)' : undefined,
                    }}
                  />
                )}
              </TableCell>
            )}
            <TableCell className="w-12"></TableCell>
            <TableCell className="w-16"></TableCell>
            <SortableTableHeader
              field="first_name"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Name
            </SortableTableHeader>
            <SortableTableHeader
              field="account"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Company
            </SortableTableHeader>
            <SortableTableHeader
              field="position"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Position
            </SortableTableHeader>
            <TableCell>Contact</TableCell>
            <SortableTableHeader
              field="status"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Status
            </SortableTableHeader>
            <SortableTableHeader
              field="health_score"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Health
            </SortableTableHeader>
            <TableCell>Tags</TableCell>
            <SortableTableHeader
              field="region"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Region
            </SortableTableHeader>
            <TableCell>Salesperson</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onSelectionChange ? 12 : 11} className="text-center py-12">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">No contacts found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <CleanFragment fragmentKey={contact.id}>
                <TableRow 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors",
                    expandedRows.has(contact.id) && "bg-muted/30"
                  )}
                  onClick={() => handleRowClick(contact.id)}
                >
                  {onSelectionChange && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isContactSelected(contact)}
                        onCheckedChange={(checked) => handleSelectContact(contact, !!checked)}
                      />
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleRowExpansion(contact.id, e)}
                      className="h-6 w-6 p-0"
                    >
                      {expandedRows.has(contact.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  
                  <TableCell>
                    <ContactAvatar 
                      firstName={contact.first_name}
                      lastName={contact.last_name}
                      email={contact.email}
                      size="sm"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </span>
                      {contact.email && (
                        <span className="text-sm text-muted-foreground">
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">{contact.account || 'N/A'}</span>
                    {contact.customer_code && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {contact.customer_code}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>{contact.position || 'N/A'}</TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {contact.telephone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{contact.telephone}</span>
                        </div>
                      )}
                      {contact.whatsapp && (
                        <div className="text-xs text-muted-foreground">
                          WhatsApp: {contact.whatsapp}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <ContactStatusBadge status={contact.status} />
                  </TableCell>
                  
                  <TableCell>
                    <ContactHealthScore score={contact.health_score} size="sm" />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <ContactTags 
                      contactId={contact.id}
                      tags={contact.tags || []}
                      onTagsChange={onContactUpdate}
                    />
                  </TableCell>
                  
                  <TableCell>{contact.region || 'N/A'}</TableCell>
                  
                  <TableCell>
                    {contact.salesperson_name || contact.salesperson || 'Unassigned'}
                  </TableCell>
                </TableRow>
                
                {expandedRows.has(contact.id) && (
                  <TableRow>
                    <TableCell colSpan={onSelectionChange ? 12 : 11} className="p-0">
                      <ContactExpandedRow contact={contact} />
                    </TableCell>
                  </TableRow>
                )}
              </CleanFragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
