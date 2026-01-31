import { formatCounty } from "../../../utils/format";
import type { PopupState } from "../hooks/usePopup";

type ParcelPopupProps = {
  popup: PopupState;
  onClose: () => void;
};

export const ParcelPopup = ({ popup, onClose }: ParcelPopupProps) => {
  if (!popup.visible) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', left: popup.x + 8, top: popup.y + 8, zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 10, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.15)', minWidth: 160 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{popup.props?.address ?? 'Parcel'}</div>
        <div style={{ fontSize: 13, color: '#333' }}>{popup.props?.formatted_value ? `$${popup.props.formatted_value}` : ''}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}><strong style={{ fontWeight: 600 }}>County:</strong> {formatCounty(popup.props?.county) || 'Unknown'}</div>
        <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}><strong style={{ fontWeight: 600 }}>Area:</strong> {popup.props?.sqft != null ? `${Number(popup.props.sqft).toLocaleString()} sqft` : '-'}</div>
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#eee' }}>Close</button>
        </div>
      </div>
    </div>
  );
};
