import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action, className, ...props }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-10', className)} {...props}>
      <p className="text-lg font-medium">{title}</p>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
