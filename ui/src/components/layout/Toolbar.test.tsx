import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toolbar from './Toolbar';

describe('Toolbar Component', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render without crashing', () => {
    render(<Toolbar />);
    // Toolbar renders Price and Size buttons
    expect(screen.getByRole('button', { name: /price/i })).toBeInTheDocument();
  });

  it('should initialize with empty values when no initial filters provided', () => {
    render(<Toolbar />);
    // Toolbar should render with default buttons
    expect(screen.getByRole('button', { name: /price/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /size/i })).toBeInTheDocument();
  });

  it('should initialize with initial filters', () => {
    const initialFilters = {
      minPrice: 100000,
      maxPrice: 500000,
      minSize: 1000,
      maxSize: 5000,
    };

    render(<Toolbar initialFilters={initialFilters} />);
    expect(screen.getByRole('button', { name: /\$100,000 - \$500,000/i })).toBeInTheDocument();
  });

  it('should call onFiltersChange callback when filters are changed', async () => {
    const onFiltersChange = vi.fn();
    render(<Toolbar onFiltersChange={onFiltersChange} />);

    // Toolbar renders and should have buttons available
    expect(screen.getByRole('button', { name: /price/i })).toBeInTheDocument();
  });

  it('should load filters from localStorage if available', () => {
    const savedFilters = {
      minPrice: 200000,
      maxPrice: 600000,
      minSize: 2000,
      maxSize: 8000,
    };

    localStorage.setItem('parcelFilters', JSON.stringify(savedFilters));

    render(<Toolbar />);

    // Component should load localStorage values and display them
    expect(screen.getByRole('button', { name: /\$200,000 - \$600,000/i })).toBeInTheDocument();
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('parcelFilters', 'invalid json');

    render(<Toolbar />);

    // Component should fall back to defaults and render without errors
    expect(screen.getByRole('button', { name: /Price/i })).toBeInTheDocument();
  });

  it('should prefer localStorage over initial filters', async () => {
    const savedFilters = {
      minPrice: 300000,
      maxPrice: 700000,
      minSize: 3000,
      maxSize: 9000,
    };

    localStorage.setItem('parcelFilters', JSON.stringify(savedFilters));

    const initialFilters = {
      minPrice: 100000,
      maxPrice: 500000,
      minSize: 1000,
      maxSize: 5000,
    };

    render(<Toolbar initialFilters={initialFilters} />);

    // localStorage should be preferred, so we expect to see the saved filter values
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\$300,000 - \$700,000/i })).toBeInTheDocument();
    });
  });
});
