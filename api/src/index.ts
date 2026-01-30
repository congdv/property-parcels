import { Hono } from 'hono'
import { cors } from 'hono/cors'
import db from './db'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.json({ message: 'Property Parcels API' }))

// Example route to test DB
app.get('/parcels', async (c) => {
  try {
    const result = await db.query('SELECT * FROM parcels LIMIT 10')
    return c.json(result.rows)
  } catch (error) {
    return c.json({ error: 'Database error' }, 500)
  }
})

export default app