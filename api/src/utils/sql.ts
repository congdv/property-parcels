// SQL for low zoom levels (Clustering)
export const CLUSTER_TILE_SQL = `
  WITH bounds AS (
    SELECT ST_TileEnvelope($1, $2, $3) AS geom
  ),
  raw_points AS (
    SELECT 
      ST_Transform(ST_Centroid(t.geom), 3857) as p_geom
    FROM takehome.dallas_parcels t, bounds b
    -- Buffer to prevent flickering on tile edges
    WHERE ST_Intersects(
      ST_Transform(t.geom, 3857), 
      ST_Expand(b.geom, (ST_XMax(b.geom) - ST_XMin(b.geom)) * 0.1)
    ) AND ($4::text IS NULL OR t.county = $4::text)
  ),
  clustered_points AS (
    SELECT 
      p_geom,
      -- Dynamic Epsilon based on tile width
      ST_ClusterDBSCAN(p_geom, 
        eps := (ST_XMax((SELECT geom FROM bounds)) - ST_XMin((SELECT geom FROM bounds))) * 60 / 4096, 
        minpoints := 2
      ) OVER() as cid
    FROM raw_points
  ),
  cluster_group as (
    SELECT 
      COUNT(*) as point_count,
      cid IS NOT NULL as is_cluster,
      ST_AsMVTGeom(
          ST_Centroid(ST_Collect(p_geom)), 
          (SELECT geom FROM bounds)
      ) AS geom
    FROM clustered_points
    GROUP BY cid, (cid IS NULL), (CASE WHEN cid IS NULL THEN p_geom ELSE NULL END)
  )
  SELECT ST_AsMVT(cluster_group.*, 'parcel-layer') AS mvt FROM cluster_group;
`;

// SQL for high zoom levels (Individual Parcels)
export const PARCEL_TILE_SQL = `
  WITH bounds AS (
    SELECT public.ST_TileEnvelope($1, $2, $3) AS geom
  ),
  mvt_geom AS (
    SELECT 
      p.sl_uuid, 
      p.total_value,
      to_char(p.total_value, 'FM999,999,999,999') AS formatted_value,
      p.county,
      p.sqft,
      p.address,
      public.ST_AsMVTGeom(
        public.ST_Transform(p.geom, 3857), 
        bounds.geom
      ) AS geom
    FROM takehome.dallas_parcels p, bounds
    WHERE public.ST_Intersects(public.ST_Transform(p.geom, 3857), bounds.geom) AND ($4::text IS NULL OR p.county = $4::text)
  )
  SELECT public.ST_AsMVT(mvt_geom.*, 'parcel-layer') AS mvt FROM mvt_geom;
`;

export const LIST_PARCELS_SQL = `
  SELECT
    sl_uuid,
    address,
    county,
    sqft,
    total_value,
    CAST(public.ST_AsGeoJSON(geom) AS jsonb) AS geometry
  FROM takehome.dallas_parcels
  LIMIT 100
`;