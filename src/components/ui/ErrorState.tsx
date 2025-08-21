import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry, className, ...props }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-10', className)} {...props}>
      <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
      <p className="text-lg font-medium">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
