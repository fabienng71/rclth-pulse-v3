
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface VendorSeparatorProps {
  title: string;
}

export const VendorSeparator = ({ title }: VendorSeparatorProps) => (
  <div className="mt-8 mb-4 relative">
    <div className="flex items-center">
      <Separator className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2" />
      <div className="relative z-10 bg-white pr-2 text-red-600 font-medium">
        {title}
      </div>
    </div>
  </div>
);

