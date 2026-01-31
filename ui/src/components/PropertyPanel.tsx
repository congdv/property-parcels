import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../env';
import CircularProgress from '@mui/material/CircularProgress';
import ParcelMap from './ParcelMap';

const PropertyPanel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/parcels`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </div>
  );

  return (
      <ParcelMap 
        parcels={data} 
      />
  );
};

export default PropertyPanel;