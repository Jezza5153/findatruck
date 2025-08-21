'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Segment {
  label: string;
  href: string;
}

function defaultSegments(pathname: string): Segment[] {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    href: '/' + parts.slice(0, i + 1).join('/'),
  }));
}

export function Breadcrumbs({ segments }: { segments?: Segment[] }) {
  const pathname = usePathname();
  const crumbs = segments ?? defaultSegments(pathname ?? '/');
  if (crumbs.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center gap-1">
        <li>
          <Link href="/" className="hover:text-foreground">Home</Link>
        </li>
        {crumbs.map((seg) => (
          <li key={seg.href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            <Link href={seg.href} className={cn('hover:text-foreground')}>{seg.label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
