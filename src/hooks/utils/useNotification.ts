import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useNotification = () => {
  const { toast, dismiss } = useToast();

  const notify = useCallback((
    type: NotificationType,
    message: string | NotificationOptions,
    options?: NotificationOptions
  ) => {
    const isString = typeof message === 'string';
    const title = isString ? undefined : message.title;
    const description = isString ? message : message.description;
    const finalOptions = isString ? options : message;

    const variantMap = {
      success: undefined,
      error: 'destructive' as const,
      warning: 'destructive' as const,
      info: undefined,
    };

    const defaultTitles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    };

    return toast({
      title: title || defaultTitles[type],
      description,
      variant: variantMap[type],
      duration: finalOptions?.duration,
      action: finalOptions?.action ? {
        altText: finalOptions.action.label,
        onClick: finalOptions.action.onClick,
      } : undefined,
    });
  }, [toast]);

  const success = useCallback((message: string | NotificationOptions, options?: NotificationOptions) => {
    return notify('success', message, options);
  }, [notify]);

  const error = useCallback((message: string | NotificationOptions, options?: NotificationOptions) => {
    return notify('error', message, options);
  }, [notify]);

  const warning = useCallback((message: string | NotificationOptions, options?: NotificationOptions) => {
    return notify('warning', message, options);
  }, [notify]);

  const info = useCallback((message: string | NotificationOptions, options?: NotificationOptions) => {
    return notify('info', message, options);
  }, [notify]);

  const dismissAll = useCallback(() => {
    dismiss();
  }, [dismiss]);

  return {
    notify,
    success,
    error,
    warning,
    info,
    dismiss: dismissAll,
  };
};