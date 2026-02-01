import VectorParcelMap from './VectorParcelMap';
import { usePopup } from './hooks/usePopup';
import { ParcelPopup } from './components/ParcelPopup';
import { useAuth } from 'react-oidc-context';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type { Filters } from '../../types/filters';

const PropertyPanel: React.FC<{ filters?: Filters; onFiltersChange?: (f: Filters) => void }> = ({
  filters,
  onFiltersChange,
}) => {
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const { popup, showPopup, hidePopup } = usePopup();
  const auth = useAuth();
  const token = auth.user?.access_token;

  if (auth.isLoading) {
    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Skeleton variant="rectangular" animation="wave" sx={{ width: '100%', height: '100%' }} />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Signing in…
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <VectorParcelMap
        accessToken={mapboxAccessToken}
        onParcelClick={showPopup}
        authToken={token}
        filters={filters}
      />
      <ParcelPopup popup={popup} onClose={hidePopup} />
    </div>
  );
};

export default PropertyPanel;
