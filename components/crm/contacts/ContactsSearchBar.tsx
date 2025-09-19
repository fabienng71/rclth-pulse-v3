
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ContactsSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const ContactsSearchBar = ({ searchQuery, onSearchChange }: ContactsSearchBarProps) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search by name or account..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
