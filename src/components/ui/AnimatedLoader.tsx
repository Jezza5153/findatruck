'use client';

import React from 'react';

/**
 * A beautiful animated loader, inspired by Stripe, Figma, and modern SaaS.
 * Props:
 *   - size: number (px) [default: 48]
 *   - color: string (hex/rgb/tailwind) [default: #06b6d4 (cyan-500)]
 */
export default function AnimatedLoader({
  size = 48,
  color = '#06b6d4',
  className = '',
  text = 'Loading...',
}: {
  size?: number;
  color?: string;
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center w-full py-8 ${className}`}
      aria-busy="true"
      role="status"
      tabIndex={-1}
    >
      <svg
        className="animate-spin drop-shadow-lg"
        style={{ width: size, height: size, color }}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-15"
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
        />
        <path
          d="M44 24a20 20 0 01-20 20"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="opacity-70"
        />
      </svg>
      <span className="mt-3 text-base font-medium text-muted-foreground animate-pulse select-none">
        {text}
      </span>
    </div>
  );
}
