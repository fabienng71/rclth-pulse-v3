
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface IncomingStockFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTransportMode: string;
  setSelectedTransportMode: (mode: string) => void;
}

const IncomingStockFilters: React.FC<IncomingStockFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedTransportMode,
  setSelectedTransportMode
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vendor name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm font-medium mr-2">Transport Mode:</span>
            <RadioGroup 
              value={selectedTransportMode} 
              onValueChange={setSelectedTransportMode}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Modes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="air" id="air" />
                <Label htmlFor="air">Air</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sea" id="sea" />
                <Label htmlFor="sea">Sea</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomingStockFilters;
