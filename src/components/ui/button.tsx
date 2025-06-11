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
        true: 'opacity-70 pointer-events-none',
        false: '',
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
 * PROOFED Button component – children-safe for both Slot and native button.
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
    const Comp = asChild ? Slot : 'button';
    const ariaDisabled = props.disabled || loading || undefined;

    // Always wrap children for Slot use!
    const content = (
      <>
        {icon && <span className="mr-2">{icon}</span>}
        <span>{children}</span>
      </>
    );

    return asChild ? (
      // When asChild, pass a single element as child!
      <Comp
        className={cn(
          buttonVariants({ variant, size, loading }),
          className
        )}
        ref={ref}
        aria-disabled={ariaDisabled}
        disabled={ariaDisabled}
        data-loading={!!loading}
        {...props}
      >
        {/* Wrap in span so Slot gets only one child */}
        <span className="flex items-center w-full">{content}</span>
      </Comp>
    ) : (
      <button
        className={cn(
          buttonVariants({ variant, size, loading }),
          className
        )}
        ref={ref}
        aria-disabled={ariaDisabled}
        disabled={ariaDisabled}
        data-loading={!!loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
