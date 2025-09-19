
import { DatePickerField } from '@/components/crm/DatePickerField';
import { useFormContext } from 'react-hook-form';

export const DateFields = () => {
  const { control } = useFormContext();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DatePickerField
        name="start_date"
        label="Start Date"
        control={control}
      />
      <DatePickerField
        name="end_date"
        label="End Date"
        control={control}
        isOptional
      />
    </div>
  );
};
