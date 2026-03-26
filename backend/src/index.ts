import 'reflect-metadata'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import './registrer.js'
import { instancesRoute } from './routes/instances.js'
import { dockerRoute } from './routes/docker.js'
import { serveStatic } from '@hono/node-server/serve-static'
const app = new Hono()

// Middleware global
app.use('*', cors())

// Gestion globale des erreurs
app.onError((err, c) => {
  console.error(err)
  return c.json(
    { error: err.message ?? 'Erreur interne du serveur' },
    500
  )
})

// Routes
app.route('/api/instances', instancesRoute);
app.route('/api/instances', dockerRoute);

// Sert les fichiers du frontend
app.use('/*', serveStatic({ root: './public' }))

// Fallback SPA — toujours renvoyer index.html
app.get('/*', serveStatic({ path: './public/index.html' }))

// Lancement du serveur
serve(
  { fetch: app.fetch, port: 3000 },
  () => console.log('Serveur démarré sur http://localhost:3000')
)