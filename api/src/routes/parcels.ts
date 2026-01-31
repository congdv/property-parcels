import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as parcelService from '../services/parcelService';

const app = new Hono<{ Variables: Record<string, any> }>();

// Schema for Tile Coordinates
const tileSchema = z.object({
  z: z.coerce.number().int().min(0).max(30),
  x: z.coerce.number().int().min(0),
  y: z.coerce.number().int().min(0),
});

app.get('/', async (c) => {
  try {
    const data = await parcelService.getParcelsList();
    return c.json(data);
  } catch (err) {
    console.error('List Error:', err);
    return c.json({ error: 'Database error' }, 500);
  }
});

// Simple authentication middleware (allows guests, marks guest in context)
const isAuthenticated = async (c: any, next: any) => {
  // Check for Authorization header
  const authHeader = c.req.header('Authorization');
  const user = authHeader ? true : false; // Simplified: if header present, authenticated
  c.set('user', user);
  if (!user) {
    c.set('isGuest', true);
  } else {
    c.set('isGuest', false);
  }
  return next();
};

// Using zValidator provides automatic 400 errors if params are invalid
app.get(
  '/:z/:x/:y',
  isAuthenticated,
  zValidator('param', tileSchema),
  async (c) => {
    const { z, x, y } = c.req.valid('param');
    const isGuest = c.get('isGuest') as boolean;

    try {
      // If guest, filter by county 'dallas'
      const filter = isGuest ? { county: 'dallas' } : {};
      const { mvt, mvtSize } = await parcelService.getParcelTile(z, x, y, filter);

      console.log(`Tile Request: ${z}/${x}/${y} | Size: ${mvtSize} | Guest: ${isGuest}`);

      if (!mvt || mvtSize === 0) {
        return c.body(null, 204);
      }

      return c.body(mvt, 200, {
        'Content-Type': 'application/vnd.mapbox-vector-tile',
        'Cache-Control': 'public, max-age=3600',
      });
    } catch (err) {
      console.error(`MVT Generation Error (${z}/${x}/${y}):`, err);
      return c.json({ error: 'Failed to generate tile' }, 500);
    }
  }
);

export default app;