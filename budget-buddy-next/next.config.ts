import type { NextConfig } from "next";

const LOCAL_IP = process.env.DEVELOPMENT_IP;

const nextConfig: NextConfig = {
    allowedDevOrigins: LOCAL_IP ? [LOCAL_IP] : [],
    output: 'export',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**', // This allows any image path from this domain
            },
            // You might also want to add Cloudinary here since you use it for products!
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            }
        ],
    },
};

export default nextConfig;
