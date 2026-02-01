import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { exportParcelsCSV } from '../services/exportService';
import { useAuth } from 'react-oidc-context';
import type { Filters } from '../types/filters';
import { CssBaseline } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import Header from '../components/layout/Header';
import '../styles/App.css';

function getFiltersFromLocalStorage(): Filters {
  try {
    const raw = localStorage.getItem('parcelFilters');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed ?? {};
  } catch (e) {
    return {};
  }
}

const ExportPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({});

  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) return;
    const stored = getFiltersFromLocalStorage();
    setFilters(stored);

    const doExport = async () => {
      setStatus('loading');
      try {
        const token = auth.user?.access_token;
        await exportParcelsCSV(stored, token);
        setStatus('done');
      } catch (e: any) {
        setError(e?.message || String(e));
        setStatus('error');
      }
    };

    // run once on mount
    doExport();
  }, [auth]);

  return (
    <div className="app-root">
      <CssBaseline />
      <Header initialFilters={filters} onFiltersChange={setFilters} hideToolbar />
      <div className="map-container">
        <Box sx={{ padding: 4, maxWidth: 720, margin: '2rem auto', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Export CSV
          </Typography>
          {status === 'loading' && (
            <div>
              <Typography>Preparing download…</Typography>
              <LinearProgress sx={{ width: '100%' }} />
            </div>
          )}
          {status === 'done' && (
            <>
              <Typography>Download started. Close this tab when you're ready.</Typography>
              <Box sx={{ marginTop: 2 }}>
                <Button href="/" variant="outlined">
                  Return Home
                </Button>
              </Box>
            </>
          )}
          {status === 'error' && (
            <>
              <Typography sx={{ color: 'error.main' }}>
                Export failed. Something went wrong. Please contact the administrator.
              </Typography>
              <Box sx={{ marginTop: 2 }}>
                <Button href="/" variant="outlined">
                  Return Home
                </Button>
              </Box>
            </>
          )}
        </Box>
      </div>
    </div>
  );
};

export default ExportPage;
