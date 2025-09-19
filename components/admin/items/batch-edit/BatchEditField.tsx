import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BatchEditFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'switch';
  value: string | number | boolean;
  checked: boolean;
  onValueChange: (value: any) => void;
  onCheckedChange: (checked: boolean) => void;
  step?: string;
  min?: string;
}

export const BatchEditField: React.FC<BatchEditFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  checked,
  onValueChange,
  onCheckedChange,
  step,
  min,
}) => {
  const renderInput = () => {
    switch (type) {
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            step={step}
            min={min}
            value={value as number}
            onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
            disabled={!checked}
          />
        );
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={id}
              checked={value as boolean}
              onCheckedChange={onValueChange}
              disabled={!checked}
            />
            <Label htmlFor={id}>{label}</Label>
          </div>
        );
      default:
        return (
          <Input
            id={id}
            value={value as string}
            onChange={(e) => onValueChange(e.target.value)}
            disabled={!checked}
          />
        );
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Checkbox
        id={`update-${id}`}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(Boolean(checked))}
      />
      <div className="flex-1 space-y-2">
        {type !== 'switch' && <Label htmlFor={id}>{label}</Label>}
        {renderInput()}
      </div>
    </div>
  );
};