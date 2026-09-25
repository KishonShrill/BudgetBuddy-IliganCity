import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { json } from 'hono/json'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())
app.use(json())

app.get('/', (c) => c.json({ message: 'Server is healthy...', healthy: true }))

export default app
