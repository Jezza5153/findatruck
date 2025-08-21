import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/trucks/abc',
}));

it('renders breadcrumb segments', () => {
  render(<Breadcrumbs />);
  expect(screen.getByText('Trucks')).toBeInTheDocument();
  expect(screen.getByText('Abc')).toBeInTheDocument();
});
