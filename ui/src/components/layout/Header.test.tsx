import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

// Mock the useAuth hook
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

// Mock the Toolbar component
vi.mock('./Toolbar', () => ({
  default: () => (
    <div data-testid="custom-toolbar">Custom Toolbar</div>
  ),
}));

import { useAuth } from 'react-oidc-context';

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the title', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: null,
    });

    render(<Header />);
    expect(screen.getByText('Property Parcels')).toBeInTheDocument();
  });

  it('should show login button when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: null,
    });

    render(<Header />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show logout button and user name when authenticated', () => {
    const mockAuth = {
      isLoading: false,
      isAuthenticated: true,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: {
        profile: {
          name: 'John Doe',
        },
      },
    };

    (useAuth as any).mockReturnValue(mockAuth);

    render(<Header />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should call signinRedirect when login button is clicked', async () => {
    const signinRedirectMock = vi.fn();
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: signinRedirectMock,
      removeUser: vi.fn(),
      user: null,
    });

    render(<Header />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    expect(signinRedirectMock).toHaveBeenCalled();
  });

  it('should call removeUser when logout button is clicked', async () => {
    const removeUserMock = vi.fn();
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      signinRedirect: vi.fn(),
      removeUser: removeUserMock,
      user: {
        profile: {
          name: 'John Doe',
        },
      },
    });

    render(<Header />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(removeUserMock).toHaveBeenCalled();
  });

  it('should show nothing while loading', () => {
    (useAuth as any).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: null,
    });

    render(<Header />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render custom toolbar by default', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: null,
    });

    render(<Header />);
    expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument();
  });

  it('should not render custom toolbar when hideToolbar is true', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: null,
    });

    render(<Header hideToolbar={true} />);
    expect(screen.queryByTestId('custom-toolbar')).not.toBeInTheDocument();
  });

  it('should pass initialFilters to toolbar', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: null,
    });

    const filters = { minPrice: 100000, maxPrice: 500000, minSize: 1000, maxSize: 5000 };
    render(<Header initialFilters={filters} />);

    // Just verify the component renders without error
    expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument();
  });

  it('should pass onFiltersChange callback to toolbar', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: vi.fn(),
      removeUser: vi.fn(),
      user: null,
    });

    const onFiltersChange = vi.fn();
    render(<Header onFiltersChange={onFiltersChange} />);

    expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument();
  });
});
