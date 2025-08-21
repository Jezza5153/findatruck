import { render } from '@testing-library/react';
import HomePage from '@/app/page';
import { vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

it('renders home page', () => {
  render(<HomePage />);
});
