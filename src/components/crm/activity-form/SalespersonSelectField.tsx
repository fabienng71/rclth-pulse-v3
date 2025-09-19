
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, UseFormSetValue } from "react-hook-form";
import { ActivityFormData } from "./formSchema";
import { useProfilesList } from "@/hooks/useProfilesList";
import { useAuthStore } from "@/stores/authStore";

interface SalespersonSelectFieldProps {
  control: Control<ActivityFormData>;
  setValue?: UseFormSetValue<ActivityFormData>;
}

export const SalespersonSelectField = ({ control, setValue }: SalespersonSelectFieldProps) => {
  const { isAdmin } = useAuthStore();
  const { data: profiles, isLoading, error } = useProfilesList();

  // Only render for admin users
  if (!isAdmin) {
    return null;
  }

  const renderProfileOptions = () => {
    if (isLoading) return <SelectItem value="loading">Loading salespeople...</SelectItem>;
    if (error) return <SelectItem value="error">Failed to load salespeople</SelectItem>;
    if (!profiles || profiles.length === 0) return <SelectItem value="none">No salespeople available</SelectItem>;

    return profiles.map((profile) => {
      const displayName = profile.full_name || "Unnamed User";
      const value = profile.id;
      
      return (
        <SelectItem key={profile.id} value={value}>
          {displayName}
        </SelectItem>
      );
    });
  };

  return (
    <FormField
      control={control}
      name="salesperson_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assigned To (Admin Only)</FormLabel>
          <Select 
            onValueChange={(value) => {
              console.log('Salesperson selected:', value);
              field.onChange(value);
              
              // Also set the salesperson_name when ID is selected
              const selectedProfile = profiles?.find(p => p.id === value);
              if (selectedProfile && setValue) {
                console.log('Setting salesperson_name to:', selectedProfile.full_name);
                setValue('salesperson_name', selectedProfile.full_name || '');
              }
            }} 
            value={field.value || ""}
            disabled={isLoading || !!error}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {renderProfileOptions()}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
