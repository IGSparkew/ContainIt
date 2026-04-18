import 'reflect-metadata'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { VolumeRouter } from './routers/volumeRouter.js'
import { InstanceRouter } from './routers/instanceRouter.js'
import { NetworkRouter } from './routers/networkRouter.js'
import { serveStatic } from '@hono/node-server/serve-static'
const app = new Hono()

// Global middleware
app.use('*', cors())

// Global error handler
app.onError((err, c) => {
  console.error(err)
  return c.json(
    { error: err.message ?? 'Internal server error' },
    500
  )
})

// Routes
app.route('/api/volumes', VolumeRouter);
app.route('/api/instances', InstanceRouter);
app.route('/api/networks', NetworkRouter);

// Serve frontend static files
app.use('/*', serveStatic({ root: './public' }))

// SPA fallback — always return index.html
app.get('/*', serveStatic({ path: './public/index.html' }))

// Start server
serve(
  { fetch: app.fetch, port: 3000 },
  () => console.log('Server running on http://localhost:3000')
)