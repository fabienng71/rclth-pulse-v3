
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactAvatarProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  firstName,
  lastName,
  email,
  size = 'md',
  className
}) => {
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || email?.charAt(0)?.toUpperCase() || '?';
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src="" alt={`${firstName} ${lastName}`} />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};
