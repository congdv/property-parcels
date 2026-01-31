import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import './styles/index.css';
import App from './App.tsx';
import { AppProviders } from './providers/AppProviders.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <CssBaseline />
      <App />
    </AppProviders>
  </StrictMode>,
);
