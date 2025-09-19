
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, User, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SearchSuggestion {
  id: string;
  type: 'customer' | 'contact' | 'activity_type' | 'recent';
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface EnhancedActivitySearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  onClearSearch?: () => void;
}

export const EnhancedActivitySearch = ({
  searchTerm,
  onSearchChange,
  suggestions = [],
  recentSearches = [],
  onClearSearch
}: EnhancedActivitySearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allSuggestions: SearchSuggestion[] = [
    ...suggestions,
    ...recentSearches.map((search, index) => ({
      id: `recent-${index}`,
      type: 'recent' as const,
      value: search,
      label: search,
      icon: <Clock className="h-3 w-3" />
    }))
  ];

  const filteredSuggestions = allSuggestions.filter(suggestion =>
    suggestion.label.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const event = {
      target: { value: suggestion.value }
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(event);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Building className="h-3 w-3" />;
      case 'contact':
        return <User className="h-3 w-3" />;
      case 'activity_type':
        return <Search className="h-3 w-3" />;
      case 'recent':
        return <Clock className="h-3 w-3" />;
      default:
        return <Search className="h-3 w-3" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      customer: 'secondary',
      contact: 'outline',
      activity_type: 'default',
      recent: 'secondary'
    } as const;

    const labels = {
      customer: 'Customer',
      contact: 'Contact',
      activity_type: 'Type',
      recent: 'Recent'
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'default'} className="text-xs">
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search activities, customers, contacts..."
              value={searchTerm}
              onChange={onSearchChange}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10 h-11 text-base"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {isOpen && (searchTerm || recentSearches.length > 0) && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border">
              <CardContent className="p-2">
                {filteredSuggestions.length > 0 ? (
                  <div className="space-y-1">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                          index === selectedIndex 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getTypeIcon(suggestion.type)}
                          <span className="truncate">{suggestion.label}</span>
                        </div>
                        {getTypeBadge(suggestion.type)}
                      </div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No suggestions found
                  </div>
                ) : (
                  <div className="text-center py-2 text-muted-foreground text-sm">
                    Start typing to search...
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {searchTerm && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-3 w-3" />
            <span>Searching across all activities</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
