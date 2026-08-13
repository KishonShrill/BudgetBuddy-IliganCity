import { config } from 'dotenv';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger-output.json' with { type: 'json' }
import path from 'path'
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contributionRoutes from './routes/contributionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

config();

const PORT = process.env.PORT || 5000; // Choose your desired port
const DEVELOPMENT = process.env.VITE_LOCALHOST || "localhost";
const uri = process.env.HIDDEN_URI;

// Initialize Database Connection
mongoose.connect(uri)
    .then(() => { console.log('✅ Connected to MongoDB'); })
    .catch(err => { console.error('❌ MongoDB connection error:', err.message); });

// CORS Configuration
const allowedOrigins = process.env.VITE_DEVELOPMENT
    ? [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://192.168.1.10:5173',
        `http://${DEVELOPMENT}:5173`,
        'http://localhost:3000',
        'https://productprice-iligan.vercel.app',
    ]
    : 'https://productprice-iligan.vercel.app';

const corsOptions = {
    origin: function(origin, callback) {
        console.log("Origin Requests: " + origin);
        console.log("Non-browser: " + !origin);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (process.env.VITE_DEVELOPMENT) {
            // ✅ Development: allow localhost, LAN IPs, curl, mobile apps
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)
            ) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS (Dev)"));
            }
        } else {
            // ✅ Production: strict allowedOrigins only
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS (Prod)"));
            }
        }
    },
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true, // Allow cookies, authorization headers if needed
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization']
};

const app = express();
app.set('trust proxy', 1); // Trust the first proxy since we are hosting in vercel
app.use(express.json());
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});

const SWAGGER_CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css";
const SWAGGER_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js";
const SWAGGER_PRESET_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js";

const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: SWAGGER_CSS_URL,
    customJs: [
        SWAGGER_JS_URL,
        SWAGGER_PRESET_JS_URL
    ]
};

app.use(['/auth/register', '/auth/login', '/api'], limiter);
app.use(
    '/api-docs',
    limiter,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Standardized Route Prefixes
app.use('/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contributions', contributionRoutes);

// Root Endpoints
app.get('/', (req, res) => { res.status(200).json({ message: 'Server is healthy...', healthy: true }); });
app.use((req, res) => { res.status(404).json({ message: 'Endpoint not found' }); });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
