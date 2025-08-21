import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/shell/AppShell';
import { vi } from 'vitest';

vi.mock('@/components/SiteHeader', () => ({ SiteHeader: () => <div>header</div> }));
vi.mock('@/components/SiteFooter', () => ({ SiteFooter: () => <div>footer</div> }));

it('renders header, footer and children', () => {
  render(<AppShell><div>body</div></AppShell>);
  expect(screen.getByText('header')).toBeInTheDocument();
  expect(screen.getByText('footer')).toBeInTheDocument();
  expect(screen.getByText('body')).toBeInTheDocument();
});
