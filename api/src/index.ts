
import './env'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import db from './db'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.json({ message: 'Property Parcels API' }))


app.get('/v1/api/parcels', async (c) => {
  try {
    const result = await db.query(`
      SELECT
        sl_uuid,
        address,
        county,
        sqft,
        total_value,
        CAST(public.ST_AsGeoJSON(geom) AS jsonb) AS geometry
      FROM takehome.dallas_parcels
      LIMIT 100
    `)
    return c.json(result.rows)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Database error' }, 500)
  }
})



const port = Number(process.env.PORT) || 3000;
serve({
  fetch: app.fetch,
  port,
}, () => {
  console.log(`Server is running on port ${port}`);
});

export default app