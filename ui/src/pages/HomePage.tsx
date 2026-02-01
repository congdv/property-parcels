import { CssBaseline } from '@mui/material';
import Header from '../components/layout/Header';
import '../styles/App.css';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import PropertyPanel from '../features/parcels/PropertyPanel';
import type { Filters } from '../types/filters';


function HomePage() {
  const auth = useAuth();
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    if (auth.isAuthenticated && window.location.search.includes('code=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, [auth.isAuthenticated]);

  return (
    <div className="app-root">
      <CssBaseline />
      <Header initialFilters={filters} onFiltersChange={setFilters} />
      <div className="map-container">
        <PropertyPanel filters={filters} onFiltersChange={setFilters} />
      </div>
    </div>
  );
}

export default HomePage;
