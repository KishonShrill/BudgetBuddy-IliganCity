import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { swaggerUI } from '@hono/swagger-ui';
import { AppEnv } from './types';
import { connectToDatabase, disconnectDatabase } from './db';
import swaggerSpec from './swagger-spec.json';

// Route stubs
import authRoutes from './routes/auth';
import reportRoutes from './routes/reports';
import productRoutes from './routes/products';
import locationRoutes from './routes/locations';
import categoryRoutes from './routes/categories';
import listingRoutes from './routes/listings';
import userRoutes from './routes/users';
import contributionRoutes from './routes/contributions';

const app = new Hono<AppEnv>();

// 1. Request logging
app.use('*', logger());

// 2. CORS configuration matching server.mjs logic
app.use('*', async (c, next) => {
  const isDev = c.env.VITE_DEVELOPMENT === 'true';
  const devHost = c.env.VITE_LOCALHOST || 'localhost';

  const allowedOrigins = isDev
    ? [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://192.168.1.10:5173',
        `http://${devHost}:5173`,
        'http://localhost:3000',
        'https://productprice-iligan.vercel.app',
        'https://budgetbuddy.betteriligancity.org',
      ]
    : [
        'https://productprice-iligan.vercel.app',
        'https://budgetbuddy.betteriligancity.org',
      ];

  const corsMiddleware = cors({
    origin: (origin) => {
      // Allow requests with no origin (e.g. mobile apps, server-to-server, curl)
      if (!origin) return origin;

      if (isDev) {
        if (
          allowedOrigins.includes(origin) ||
          /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)
        ) {
          return origin;
        }
        return null;
      } else {
        if (allowedOrigins.includes(origin)) {
          return origin;
        }
        return null;
      }
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Origin',
      'X-Requested-With',
      'Content',
      'Accept',
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

// 3. Database connection middleware for API and Auth routes
app.use('/api/*', async (c, next) => {
  if (c.env.HIDDEN_URI) {
    await connectToDatabase(c.env.HIDDEN_URI);
  }
  try {
    await next();
  } finally {
    await disconnectDatabase();
  }
});

app.use('/auth/*', async (c, next) => {
  if (c.env.HIDDEN_URI) {
    await connectToDatabase(c.env.HIDDEN_URI);
  }
  try {
    await next();
  } finally {
    await disconnectDatabase();
  }
});

// 4. Swagger UI Documentation
app.get('/api-docs/spec', (c) => {
  return c.json(swaggerSpec);
});

app.get(
  '/api-docs',
  swaggerUI({
    url: '/api-docs/spec',
  })
);

// 5. Standardized Route Prefixes (Stubs for future phase implementation)
app.route('/auth', authRoutes);
app.route('/api/reports', reportRoutes);

app.route('/api/v1/products', productRoutes);
app.route('/api/v1/locations', locationRoutes);
app.route('/api/v1/categories', categoryRoutes);
app.route('/api/v1/listings', listingRoutes);
app.route('/api/v1/users', userRoutes);
app.route('/api/v1/contributions', contributionRoutes);

// 6. Root & Health Endpoint
app.get('/', (c) => {
  return c.json({ message: 'Server is healthy...', healthy: true });
});

// 7. 404 Catch-All Handler
app.notFound((c) => {
  return c.json({ message: 'Endpoint not found' }, 404);
});

// 8. Global Error Handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      success: false,
      message: err.message || 'Internal Server Error',
    },
    500
  );
});

export default app;
