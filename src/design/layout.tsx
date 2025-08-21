import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-screen-xl px-4', className)} {...props} />;
}

export function Stack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-4', className)} {...props} />;
}

export function Grid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-4', className)} {...props} />;
}

export function Page({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-12', className)} {...props} />;
}

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumb, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('pb-6', className)} {...props}>
      {breadcrumb}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="mt-4 md:mt-0 flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function PageSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('py-8', className)} {...props} />;
}
