import db from '../db';
import { CLUSTER_TILE_SQL, PARCEL_TILE_SQL, LIST_PARCELS_SQL } from '../utils/sql';

export const getParcelsList = async () => {
  const result = await db.query(LIST_PARCELS_SQL);
  return result.rows;
};

export const getParcelTile = async (z: number, x: number, y: number) => {
  // Logic switch: Use clustering for zoom <= 13, raw parcels for > 13
  const isClustering = z <= 13;
  const sql = isClustering ? CLUSTER_TILE_SQL : PARCEL_TILE_SQL;
  
  const result = await db.query(sql, [z, x, y]);
  
  const mvt = result.rows[0]?.mvt;
  const mvtSize = mvt ? (mvt.length ?? Buffer.byteLength(mvt)) : 0;
  
  return { mvt, mvtSize };
};