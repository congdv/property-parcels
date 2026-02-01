import React, { useRef, useState, useEffect, useCallback } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import { API_BASE_URL } from '../../env';
import type { Filters } from '../../types/filters';

const VectorParcelMap: React.FC<{
  accessToken: string;
  onParcelClick?: (payload: {
    feature: any;
    lngLat?: any;
    point?: any;
    client?: { x: number; y: number };
  }) => void;
  authToken?: string;
  filters?: Filters;
}> = ({ accessToken, onParcelClick, authToken, filters }) => {
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  const transformRequest = useCallback(
    (url: string) => {
      const headers: Record<string, string> = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      return { url, headers };
    },
    [authToken],
  );

  const handleMapClick = (e: any) => {
    const features = e?.features ?? [];
    const parcelFeature = features.find((f: any) => f.layer?.id === 'parcel-labels');
    if (parcelFeature && onParcelClick) {
      const client = e?.originalEvent
        ? { x: e.originalEvent.clientX, y: e.originalEvent.clientY }
        : undefined;
      onParcelClick({ feature: parcelFeature, lngLat: e?.lngLat, point: e?.point, client });
    }
  };

  const handleMouseMove = (e: any) => {
    const features = e?.features ?? [];
    const overLabel = features.some((f: any) => f.layer?.id === 'parcel-labels');
    const maybeMap = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
    if (maybeMap && maybeMap.getCanvas) {
      maybeMap.getCanvas().style.cursor = overLabel ? 'pointer' : '';
    }
  };

  const handleMouseLeave = () => {
    const maybeMap = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
    if (maybeMap && maybeMap.getCanvas) maybeMap.getCanvas().style.cursor = '';
  };

  useEffect(() => {
    let mounted = true;
    let retryTimer: number | null = null;
    let fallbackTimer: number | null = null;
    let attachedMap: any = null;

    const tryAttach = () => {
      if (!mounted) return;
      const maybeMap = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
      if (!maybeMap) {
        retryTimer = window.setTimeout(tryAttach, 200);
        return;
      }
      attachedMap = maybeMap;

      // Fallback: stop showing loading after 10s in case events don't fire
      fallbackTimer = window.setTimeout(() => setLoading(false), 10000);

      const onSourceData = (e: any) => {
        if (e.sourceId === 'parcel-tiles') {
          if (attachedMap.isSourceLoaded && attachedMap.isSourceLoaded('parcel-tiles')) {
            setLoading(false);
            if (fallbackTimer) {
              clearTimeout(fallbackTimer);
              fallbackTimer = null;
            }
          } else {
            setLoading(true);
          }
        }
      };

      const onDataLoading = (e: any) => {
        if (e.sourceId === 'parcel-tiles') setLoading(true);
      };

      const onIdle = () => {
        try {
          if (attachedMap.isSourceLoaded && attachedMap.isSourceLoaded('parcel-tiles')) {
            setLoading(false);
            if (fallbackTimer) {
              clearTimeout(fallbackTimer);
              fallbackTimer = null;
            }
          }
        } catch (err) {
          // ignore
        }
      };

      attachedMap.on('sourcedata', onSourceData);
      attachedMap.on('dataloading', onDataLoading);
      attachedMap.on('idle', onIdle);

      // store cleanup on the attachedMap object so we can remove in cleanup
      (attachedMap as any).__parcelListeners = { onSourceData, onDataLoading, onIdle };
    };

    tryAttach();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (attachedMap && (attachedMap as any).__parcelListeners) {
        const { onSourceData, onDataLoading, onIdle } = (attachedMap as any).__parcelListeners;
        attachedMap.off('sourcedata', onSourceData);
        attachedMap.off('dataloading', onDataLoading);
        attachedMap.off('idle', onIdle);
        delete (attachedMap as any).__parcelListeners;
      }
    };
  }, []);

  const buildTileUrl = (f?: Filters) => {
    const params = new URLSearchParams();
    if (f?.minPrice != null) params.set('minPrice', String(f.minPrice));
    if (f?.maxPrice != null) params.set('maxPrice', String(f.maxPrice));
    if (f?.minSize != null) params.set('minSize', String(f.minSize));
    if (f?.maxSize != null) params.set('maxSize', String(f.maxSize));
    if (f?.searchQuery) params.set('searchQuery', String(f.searchQuery));
    const qs = params.toString();
    return `${API_BASE_URL}/parcels/{z}/{x}/{y}${qs ? `?${qs}` : ''}`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            padding: '6px 10px',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          Loading parcels…
        </div>
      )}

      <Map
        initialViewState={{ longitude: -96.7, latitude: 33.0, zoom: 10 }}
        mapboxAccessToken={accessToken}
        mapStyle="mapbox://styles/mapbox/light-v11"
        ref={mapRef}
        interactiveLayerIds={['clusters', 'cluster-count', 'parcel-labels']}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '100%' }}
        transformRequest={transformRequest}
      >
        <Source
          id="parcel-tiles"
          type="vector"
          tiles={[buildTileUrl(filters)]}
          minzoom={6}
          maxzoom={14}
        >
          <Layer
            id="clusters"
            type="circle"
            source-layer="parcel-layer" // Matches the name in ST_AsMVT
            filter={['has', 'point_count']}
            maxzoom={14}
            paint={{
              // teal-ish step colors depending on size
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#2b5055',
                10,
                '#2b8f8f',
                25,
                '#1f7f7f',
                50,
                '#145f5f',
              ],
              'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 25, 26, 50, 34],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />

          <Layer
            id="cluster-count"
            type="symbol"
            source-layer="parcel-layer"
            filter={['has', 'point_count']}
            layout={{
              // Use explicit expression to read numeric property
              'text-field': ['to-string', ['get', 'point_count']],
              'text-size': 12,
              'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
              'text-ignore-placement': true,
              'text-allow-overlap': true,
            }}
            // Only show cluster counts up to the zoom where server-side clustering is applied
            maxzoom={14}
            paint={{ 'text-color': '#fff' }}
          />

          {/* Border Layer for the Parcels */}
          <Layer
            id="parcels-border"
            type="line"
            source-layer="parcel-layer" // This must match the layer name from your tile server
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
            minzoom={14}
            paint={{
              'line-color': '#cc8b8b',
              'line-width': 1.5,
              'line-opacity': 0.9,
            }}
          />

          {/* Address and Price Label Layer */}
          <Layer
            id="parcel-labels"
            type="symbol"
            source-layer="parcel-layer"
            minzoom={14} // Only show labels when zoomed in close to avoid clutter
            layout={{
              // show address on first line and value on second line
              'text-field': ['concat', '$', ['get', 'formatted_value']],
              // scale text size with zoom for readability
              'text-size': ['interpolate', ['linear'], ['zoom'], 14, 12, 17, 16],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
              'text-offset': [0, -0.6],
              'text-anchor': 'top',
              'text-ignore-placement': false,
              'text-allow-overlap': false,
            }}
            paint={{
              'text-color': '#1f5660',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
              'text-halo-blur': 1,
              'text-opacity': 0.95,
            }}
          />
        </Source>
      </Map>
    </div>
  );
};

export default VectorParcelMap;
