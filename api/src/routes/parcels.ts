import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as parcelService from '../services/parcelService';

const app = new Hono();

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

// Using zValidator provides automatic 400 errors if params are invalid
app.get('/:z/:x/:y', zValidator('param', tileSchema), async (c) => {
  const { z, x, y } = c.req.valid('param');

  try {
    const { mvt, mvtSize } = await parcelService.getParcelTile(z, x, y);

    console.log(`Tile Request: ${z}/${x}/${y} | Size: ${mvtSize}`);

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
});

export default app;