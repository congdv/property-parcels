
import React, { useMemo } from 'react';
import Map, { Marker, Source, Layer, type MapProps } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection, Polygon, GeoJsonProperties } from 'geojson';

interface ParcelGeometry {
  type: string;
  geometries: Array<{
    type: 'Point' | 'Polygon';
    coordinates: any;
  }>;
}

interface Parcel {
  sl_uuid: string;
  address: string;
  geometry: ParcelGeometry;
  [key: string]: any;
}

interface ParcelMapProps extends Partial<MapProps> {
  parcels: Parcel[];
}




const ParcelMap: React.FC<ParcelMapProps> = ({ parcels, ...mapProps }) => {
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const { polygonData, initialViewState } = useMemo(() => {
    const features = parcels.reduce<any[]>((acc, parcel) => {
      const poly = parcel.geometry.geometries.find(g => g.type === 'Polygon');
      if (poly) {
        acc.push({
          type: 'Feature',
          geometry: poly,
          properties: { id: parcel.sl_uuid, address: parcel.address },
        });
      }
      return acc;
    }, []);

    // Find center based on first available point
    const firstPoint = parcels[0]?.geometry.geometries.find(g => g.type === 'Point');
    let longitude = -96.8;
    let latitude = 32.8;
    let zoom = 9;

    if (
      firstPoint &&
      Array.isArray(firstPoint.coordinates) &&
      typeof firstPoint.coordinates[0] === 'number' &&
      typeof firstPoint.coordinates[1] === 'number'
    ) {
      longitude = firstPoint.coordinates[0];
      latitude = firstPoint.coordinates[1];
      zoom = 9;
    }

    return {
      polygonData: { type: 'FeatureCollection', features } as FeatureCollection<Polygon>,
      initialViewState: { longitude, latitude, zoom }
    };
  }, [parcels]);



  return (
    <div style={{ flex: 1, width: '100%', minHeight: 0, height: '100%' }}>
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={mapboxAccessToken}
      >
        {/* Markers for parcel points */}
        {parcels.map(parcel => {
          const point = parcel.geometry.geometries.find(g => g.type === 'Point');
          if (
            !point ||
            !Array.isArray(point.coordinates) ||
            typeof point.coordinates[0] !== 'number' ||
            typeof point.coordinates[1] !== 'number'
          ) {
            return null;
          }
          return (
            <Marker
              key={parcel.sl_uuid}
              longitude={point.coordinates[0]}
              latitude={point.coordinates[1]}
              anchor="bottom"
            >
              <div style={{ background: '#1976d2', color: 'white', borderRadius: '50%', padding: 4, fontSize: 12, cursor: 'pointer' }} title={parcel.address}>
                ●
              </div>
            </Marker>
          );
        })}

        {/* Polygons for parcel boundaries */}
        <Source id="parcels" type="geojson" data={polygonData}>
          <Layer
            id="parcel-fill"
            type="fill"
            paint={{
              'fill-color': '#1976d2',
              'fill-opacity': 0.2,
            }}
          />
          <Layer
            id="parcel-outline"
            type="line"
            paint={{
              'line-color': '#1976d2',
              'line-width': 2,
            }}
          />
        </Source>
      </Map>
    </div>
  );
};

export default ParcelMap;
