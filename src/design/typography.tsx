import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function H1({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn('scroll-m-20 text-4xl font-bold tracking-tight', className)} {...props} />;
}

export function H2({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('scroll-m-20 text-3xl font-semibold tracking-tight', className)} {...props} />;
}

export function H3({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props} />;
}

export function Text({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('leading-7', className)} {...props} />;
}

export function Lead({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xl text-muted-foreground', className)} {...props} />;
}
