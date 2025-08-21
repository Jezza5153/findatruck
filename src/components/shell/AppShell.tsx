import React from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
