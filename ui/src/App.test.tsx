import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock pages
vi.mock('./pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('./pages/ExportPage', () => ({
  default: () => <div data-testid="export-page">Export Page</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render HomePage at root path', () => {
    // Mock window.location.pathname
    delete (window as any).location;
    (window as any).location = { pathname: '/' };

    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should render ExportPage at /export path', () => {
    delete (window as any).location;
    (window as any).location = { pathname: '/export' };

    render(<App />);
    expect(screen.getByTestId('export-page')).toBeInTheDocument();
  });

  it('should render HomePage for any other path', () => {
    delete (window as any).location;
    (window as any).location = { pathname: '/other-path' };

    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
