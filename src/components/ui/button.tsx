'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// CVA for variants and sizes
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 active:scale-95',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10 p-0',
      },
      loading: {
        true: 'opacity-80 pointer-events-none',
        false: '', // No extra class when not loading
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Beautiful, variant-powered Button component (shadcn/ui-inspired).
 * - Supports loading, icon, asChild for custom elements (e.g., Next.js Link).
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    // If asChild, use Slot (Radix). Otherwise, <button>.
    const Comp = asChild ? Slot : 'button';

    // ARIA disabled if loading or explicitly disabled
    const ariaDisabled = props.disabled || loading || undefined;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, loading }),
          className
        )}
        ref={ref}
        aria-busy={loading || undefined}
        aria-disabled={ariaDisabled}
        disabled={ariaDisabled}
        data-loading={!!loading}
        {...props}
      >
        {/* Loader takes precedence over icon */}
        {loading ? (
          <span className="mr-2 animate-spin" aria-hidden="true">
            <svg className="size-4" viewBox="0 0 16 16" fill="none">
              <circle
                className="opacity-30"
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M15 8a7 7 0 01-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-70"
              />
            </svg>
          </span>
        ) : (
          icon && <span className="mr-2">{icon}</span>
        )}
        {/* Use <span> for text for correct spacing */}
        <span>{children}</span>
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
