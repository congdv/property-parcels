import { CssBaseline } from '@mui/material';
import Header from '../components/layout/Header';
import '../styles/App.css';
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import PropertyPanel from '../features/parcels/PropertyPanel';


function HomePage() {
  const auth = useAuth();

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
      <Header />
      <div className="map-container">
        <PropertyPanel />
      </div>
    </div>
  );
}

export default HomePage;
