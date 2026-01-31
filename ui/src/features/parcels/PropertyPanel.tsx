import VectorParcelMap from './VectorParcelMap';
import { usePopup } from './hooks/usePopup';
import { ParcelPopup } from './components/ParcelPopup';

const PropertyPanel = () => {
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const { popup, showPopup, hidePopup } = usePopup();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <VectorParcelMap accessToken={mapboxAccessToken} onParcelClick={showPopup} />
      <ParcelPopup popup={popup} onClose={hidePopup} />
    </div>
  );
};

export default PropertyPanel;
