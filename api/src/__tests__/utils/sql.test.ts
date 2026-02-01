import {
  CLUSTER_TILE_SQL,
  PARCEL_TILE_SQL,
  LIST_PARCELS_SQL,
  LIST_PARCELS_FILTER_SQL,
} from '../../utils/sql';

describe('SQL Queries', () => {
  describe('CLUSTER_TILE_SQL', () => {
    it('should be defined as a string', () => {
      expect(CLUSTER_TILE_SQL).toBeDefined();
      expect(typeof CLUSTER_TILE_SQL).toBe('string');
    });

    it('should contain CTE with bounds', () => {
      expect(CLUSTER_TILE_SQL).toContain('WITH bounds AS');
      expect(CLUSTER_TILE_SQL).toContain('ST_TileEnvelope');
    });

    it('should use ST_ClusterDBSCAN for clustering', () => {
      expect(CLUSTER_TILE_SQL).toContain('ST_ClusterDBSCAN');
      expect(CLUSTER_TILE_SQL).toContain('minpoints := 2');
    });

    it('should filter by county', () => {
      expect(CLUSTER_TILE_SQL).toContain('$4::text IS NULL OR t.county');
    });

    it('should filter by total_value (price)', () => {
      expect(CLUSTER_TILE_SQL).toContain(
        '$5::numeric IS NULL OR t.total_value >= $5::numeric'
      );
      expect(CLUSTER_TILE_SQL).toContain(
        '$6::numeric IS NULL OR t.total_value <= $6::numeric'
      );
    });

    it('should filter by sqft (size)', () => {
      expect(CLUSTER_TILE_SQL).toContain(
        '$7::numeric IS NULL OR t.sqft >= $7::numeric'
      );
      expect(CLUSTER_TILE_SQL).toContain(
        '$8::numeric IS NULL OR t.sqft <= $8::numeric'
      );
    });

    it('should use ST_AsMVT for vector tile output', () => {
      expect(CLUSTER_TILE_SQL).toContain('ST_AsMVT');
      expect(CLUSTER_TILE_SQL).toContain('parcel-layer');
    });

    it('should transform coordinates to 3857 (Web Mercator)', () => {
      expect(CLUSTER_TILE_SQL).toContain('ST_Transform');
      expect(CLUSTER_TILE_SQL).toContain('3857');
    });

    it('should use buffered bounds to prevent flickering', () => {
      expect(CLUSTER_TILE_SQL).toContain('ST_Expand');
    });
  });

  describe('PARCEL_TILE_SQL', () => {
    it('should be defined as a string', () => {
      expect(PARCEL_TILE_SQL).toBeDefined();
      expect(typeof PARCEL_TILE_SQL).toBe('string');
    });

    it('should contain CTE with bounds', () => {
      expect(PARCEL_TILE_SQL).toContain('WITH bounds AS');
      expect(PARCEL_TILE_SQL).toContain('ST_TileEnvelope');
    });

    it('should select individual parcel properties', () => {
      expect(PARCEL_TILE_SQL).toContain('p.sl_uuid');
      expect(PARCEL_TILE_SQL).toContain('p.total_value');
      expect(PARCEL_TILE_SQL).toContain('p.county');
      expect(PARCEL_TILE_SQL).toContain('p.sqft');
      expect(PARCEL_TILE_SQL).toContain('p.address');
    });

    it('should format total_value as currency string', () => {
      expect(PARCEL_TILE_SQL).toContain('to_char');
      expect(PARCEL_TILE_SQL).toContain('FM999,999,999,999');
      expect(PARCEL_TILE_SQL).toContain('formatted_value');
    });

    it('should filter by county', () => {
      expect(PARCEL_TILE_SQL).toContain('$4::text IS NULL OR p.county');
    });

    it('should filter by total_value (price)', () => {
      expect(PARCEL_TILE_SQL).toContain(
        '$5::numeric IS NULL OR p.total_value >= $5::numeric'
      );
      expect(PARCEL_TILE_SQL).toContain(
        '$6::numeric IS NULL OR p.total_value <= $6::numeric'
      );
    });

    it('should filter by sqft (size)', () => {
      expect(PARCEL_TILE_SQL).toContain(
        '$7::numeric IS NULL OR p.sqft >= $7::numeric'
      );
      expect(PARCEL_TILE_SQL).toContain(
        '$8::numeric IS NULL OR p.sqft <= $8::numeric'
      );
    });

    it('should use ST_AsMVTGeom for geometry', () => {
      expect(PARCEL_TILE_SQL).toContain('ST_AsMVTGeom');
    });

    it('should use ST_AsMVT for vector tile output', () => {
      expect(PARCEL_TILE_SQL).toContain('ST_AsMVT');
      expect(PARCEL_TILE_SQL).toContain('parcel-layer');
    });

    it('should transform coordinates to 3857 (Web Mercator)', () => {
      expect(PARCEL_TILE_SQL).toContain('ST_Transform');
      expect(PARCEL_TILE_SQL).toContain('3857');
    });

    it('should check spatial intersection with bounds', () => {
      expect(PARCEL_TILE_SQL).toContain('ST_Intersects');
    });
  });

  describe('LIST_PARCELS_SQL', () => {
    it('should be defined as a string', () => {
      expect(LIST_PARCELS_SQL).toBeDefined();
      expect(typeof LIST_PARCELS_SQL).toBe('string');
    });

    it('should select key parcel fields', () => {
      expect(LIST_PARCELS_SQL).toContain('sl_uuid');
      expect(LIST_PARCELS_SQL).toContain('address');
      expect(LIST_PARCELS_SQL).toContain('county');
      expect(LIST_PARCELS_SQL).toContain('sqft');
      expect(LIST_PARCELS_SQL).toContain('total_value');
    });

    it('should convert geometry to GeoJSON', () => {
      expect(LIST_PARCELS_SQL).toContain('ST_AsGeoJSON');
      expect(LIST_PARCELS_SQL).toContain('geometry');
    });

    it('should cast geometry to JSONB', () => {
      expect(LIST_PARCELS_SQL).toContain('CAST');
      expect(LIST_PARCELS_SQL).toContain('jsonb');
    });

    it('should limit results to 100', () => {
      expect(LIST_PARCELS_SQL).toContain('LIMIT 100');
    });

    it('should query from dallas_parcels table', () => {
      expect(LIST_PARCELS_SQL).toContain('dallas_parcels');
    });
  });

  describe('LIST_PARCELS_FILTER_SQL', () => {
    it('should be defined as a string', () => {
      expect(LIST_PARCELS_FILTER_SQL).toBeDefined();
      expect(typeof LIST_PARCELS_FILTER_SQL).toBe('string');
    });

    it('should select key parcel fields', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain('sl_uuid');
      expect(LIST_PARCELS_FILTER_SQL).toContain('address');
      expect(LIST_PARCELS_FILTER_SQL).toContain('county');
      expect(LIST_PARCELS_FILTER_SQL).toContain('sqft');
      expect(LIST_PARCELS_FILTER_SQL).toContain('total_value');
    });

    it('should format total_value as currency string', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain('to_char');
      expect(LIST_PARCELS_FILTER_SQL).toContain('FM999,999,999,999');
      expect(LIST_PARCELS_FILTER_SQL).toContain('formatted_value');
    });

    it('should have optional county filter', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain(
        '$1::text IS NULL OR p.county = $1::text'
      );
    });

    it('should have optional minimum price filter', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain(
        '$2::numeric IS NULL OR p.total_value >= $2::numeric'
      );
    });

    it('should have optional maximum price filter', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain(
        '$3::numeric IS NULL OR p.total_value <= $3::numeric'
      );
    });

    it('should have optional minimum size filter', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain(
        '$4::numeric IS NULL OR p.sqft >= $4::numeric'
      );
    });

    it('should have optional maximum size filter', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain(
        '$5::numeric IS NULL OR p.sqft <= $5::numeric'
      );
    });

    it('should query from dallas_parcels table', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain('dallas_parcels');
    });
  });

  describe('SQL Parameter Order Consistency', () => {
    it('CLUSTER_TILE_SQL and PARCEL_TILE_SQL should use same parameter order', () => {
      // Both should have parameters for: z, x, y, county, minPrice, maxPrice, minSize, maxSize
      const clusterParams = [
        '$1',
        '$2',
        '$3',
        '$4',
        '$5',
        '$6',
        '$7',
        '$8',
      ];
      const parcelParams = [
        '$1',
        '$2',
        '$3',
        '$4',
        '$5',
        '$6',
        '$7',
        '$8',
      ];

      clusterParams.forEach((param) => {
        expect(CLUSTER_TILE_SQL).toContain(param);
      });

      parcelParams.forEach((param) => {
        expect(PARCEL_TILE_SQL).toContain(param);
      });
    });

    it('LIST_PARCELS_FILTER_SQL should use parameters in order: county, minPrice, maxPrice, minSize, maxSize', () => {
      expect(LIST_PARCELS_FILTER_SQL).toContain('$1::text');
      expect(LIST_PARCELS_FILTER_SQL).toContain('$2::numeric');
      expect(LIST_PARCELS_FILTER_SQL).toContain('$3::numeric');
      expect(LIST_PARCELS_FILTER_SQL).toContain('$4::numeric');
      expect(LIST_PARCELS_FILTER_SQL).toContain('$5::numeric');
    });
  });
});
