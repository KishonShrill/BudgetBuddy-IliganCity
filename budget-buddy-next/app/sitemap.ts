import { MetadataRoute } from 'next';
import axios from 'axios';

// 1. Setup Environment and URLs
const SITE_URL = 'https://productprice-iligan.vercel.app';
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";

const LOCATIONS_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/locations`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/locations`;

export const dynamic = "force-static"

// 2. Fetch logic for dynamic routes
async function getLocations() {
    try {
        const response = await axios.get(LOCATIONS_URL);
        if (Array.isArray(response.data)) {
            return response.data.map((location: any) => location._id);
        }
        return [];
    } catch (error) {
        console.error("Sitemap Fetch Error:", error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 3. Define Static Pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/locations`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/receipt`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // 4. Fetch Dynamic Location Slugs
    const locationSlugs = await getLocations();

    const dynamicPages: MetadataRoute.Sitemap = locationSlugs.map((slug) => ({
        url: `${SITE_URL}/location/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticPages, ...dynamicPages];
}
