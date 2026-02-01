import db from "../db";
import { cacheGet, cacheSet } from "../cache";
import {
  CLUSTER_TILE_SQL,
  PARCEL_TILE_SQL,
  LIST_PARCELS_SQL,
} from "../utils/sql";

export const getParcelsList = async () => {
  const cacheKey = "parcels:list";

  // Try to get from cache first
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

  // Query database if not in cache
  const result = await db.query(LIST_PARCELS_SQL);
  const rows = result.rows;

  // Store in cache with 1 month TTL
  await cacheSet(cacheKey, rows);

  return rows;
};

export const getParcelsForExport = async (filter?: {
  county?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minSize?: number | null;
  maxSize?: number | null;
  searchQuery?: string | null;
}) => {
  const county = filter?.county || null;
  const minPrice = filter?.minPrice ?? null;
  const maxPrice = filter?.maxPrice ?? null;
  const minSize = filter?.minSize ?? null;
  const maxSize = filter?.maxSize ?? null;
  const searchQuery = filter?.searchQuery || null;

  // Import the filtered SQL lazily to avoid circular ordering in file
  const { LIST_PARCELS_FILTER_SQL } = await import("../utils/sql");
  const params = [county, minPrice, maxPrice, minSize, maxSize, searchQuery];
  const result = await db.query(LIST_PARCELS_FILTER_SQL, params);
  return result.rows;
};

export const getParcelTile = async (
  z: number,
  x: number,
  y: number,
  filter?: {
    county?: string;
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    maxSize?: number;
    searchQuery?: string;
  },
) => {
  // Create cache key from tile coordinates and filters
  const cacheKey = `parcels:tile:${z}:${x}:${y}:${JSON.stringify(filter || {})}`;

  // Try to get from cache first
  const cached = await cacheGet(cacheKey);
  if (cached) {
    // Convert mvt back to Buffer if it was serialized
    if (cached.mvt && cached.mvt.type === 'Buffer' && cached.mvt.data) {
      cached.mvt = Buffer.from(cached.mvt.data);
    }
    return cached;
  }

  // Logic switch: Use clustering for zoom <= 13, raw parcels for > 13
  const isClustering = z <= 13;
  const sql = isClustering ? CLUSTER_TILE_SQL : PARCEL_TILE_SQL;

  const county = filter?.county || null;
  const minPrice = filter?.minPrice ?? null;
  let maxPrice = filter?.maxPrice ?? null;
  const minSize = filter?.minSize ?? null;
  let maxSize = filter?.maxSize ?? null;
  const searchQuery = filter?.searchQuery || null;

  if (maxPrice === 10000000) {
    maxPrice = null;
  }

  if (maxSize === 10000) {
    maxSize = null;
  }

  const params = [z, x, y, county, minPrice, maxPrice, minSize, maxSize, searchQuery];
  const result = await db.query(sql, params);

  const mvt = result.rows[0]?.mvt;
  const mvtSize = mvt ? (mvt.length ?? Buffer.byteLength(mvt)) : 0;

  const response = { mvt, mvtSize };

  // Store in cache with 1 month TTL
  await cacheSet(cacheKey, response);

  return response;
};
