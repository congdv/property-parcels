import db from '../db';
import { CLUSTER_TILE_SQL, PARCEL_TILE_SQL, LIST_PARCELS_SQL } from '../utils/sql';

export const getParcelsList = async () => {
  const result = await db.query(LIST_PARCELS_SQL);
  return result.rows;
};

export const getParcelTile = async (
  z: number,
  x: number,
  y: number,
  filter?: { county?: string; minPrice?: number; maxPrice?: number; minSize?: number; maxSize?: number }
) => {
  // Logic switch: Use clustering for zoom <= 13, raw parcels for > 13
  const isClustering = z <= 13;
  const sql = isClustering ? CLUSTER_TILE_SQL : PARCEL_TILE_SQL;
  
  const county = filter?.county || null;
  const minPrice = filter?.minPrice ?? null;
  let maxPrice = filter?.maxPrice ?? null;
  const minSize = filter?.minSize ?? null;
  let maxSize = filter?.maxSize ?? null;

  if (maxPrice === 10000000) {
    maxPrice = null;
  }

  if (maxSize === 10000) {
    maxSize = null;
  }

  const params = [z, x, y, county, minPrice, maxPrice, minSize, maxSize];
  const result = await db.query(sql, params);
  
  const mvt = result.rows[0]?.mvt;
  const mvtSize = mvt ? (mvt.length ?? Buffer.byteLength(mvt)) : 0;
  
  return { mvt, mvtSize };
};