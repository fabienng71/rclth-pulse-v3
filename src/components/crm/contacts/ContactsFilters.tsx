
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useProfilesList } from "@/hooks/useProfilesList";
import { Contact } from "@/hooks/useContactsData";

interface ContactsFiltersProps {
  contacts: Contact[];
  onSalespersonFilter: (value: string) => void;
  onRegionFilter: (value: string) => void;
  selectedSalesperson: string;
  selectedRegion: string;
}

export const ContactsFilters = ({ 
  contacts, 
  onSalespersonFilter, 
  onRegionFilter,
  selectedSalesperson,
  selectedRegion
}: ContactsFiltersProps) => {
  const { data: salespeople, isLoading, error } = useProfilesList();
  
  // Get unique regions from contacts, filter out any nullish or empty values
  const uniqueRegions = Array.from(
    new Set(contacts
      .map(contact => contact.region)
      .filter(region => region && region.trim() !== '')
    )
  ).sort();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="w-full sm:w-64">
        <Select 
          value={selectedSalesperson || "all"} 
          onValueChange={onSalespersonFilter}
          disabled={isLoading || !!error}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by salesperson" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Salespeople</SelectItem>
            {salespeople?.map((profile) => {
              // Ensure we have a valid profile name or generate a fallback
              const name = profile.full_name?.trim() || `Unknown-${profile.id || Math.random().toString(36).substring(7)}`;
              const value = profile.spp_code?.trim() || profile.id || `code-${Math.random().toString(36).substring(7)}`;
              
              return (
                <SelectItem 
                  key={profile.id || `profile-${Math.random().toString(36).substring(7)}`} 
                  value={value}
                >
                  {name} {profile.spp_code && `(${profile.spp_code})`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-64">
        <Select value={selectedRegion || "all"} onValueChange={onRegionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {uniqueRegions.map((region) => (
              <SelectItem 
                key={region || `region-${Math.random().toString(36).substring(7)}`} 
                value={region}
              >
                {region}
              </SelectItem>
            ))}
            {uniqueRegions.length === 0 && (
              <SelectItem value="no-regions">No regions available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
