import { useToast as useBaseToast } from '@/components';

type ToastVariant = 'default' | 'destructive';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

export const useToast = () => {
  const { addToast, ...rest } = useBaseToast();

  const toast = ({ title, description, variant }: ToastOptions) => {
    const msg = [title, description].filter(Boolean).join(' - ');
    addToast(msg || '...', variant === 'destructive' ? 'error' : 'success');
  };

  return {
    toast,
    ...rest,
  };
};
