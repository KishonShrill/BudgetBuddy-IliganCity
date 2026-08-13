import { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import LocationsClient from './LocationsClient';

// 1. Native Next.js SEO
export const metadata: Metadata = {
    title: "Locations - Budget Buddy",
    description: "Browse through all the locations budget buddy has collected from the community. Track your expenses and never overspend in Iligan City.",
    openGraph: {
        images: ["https://res.cloudinary.com/dlmabgte3/image/upload/v1774841736/a0d74607-3a7c-4528-9170-b4a6ac7f31c0.png"]
    }
};

export default async function LocationsPage() {
    const queryClient = new QueryClient();

    const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
    const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/locations`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/locations`;

    // 1. Prefetch the data on the server
    await queryClient.prefetchQuery({
        queryKey: ['fetchedLocations'],
        queryFn: async () => {
            const res = await axios.get(DATABASE_URL);
            return res.data;
        },
    });

    return (
        // 2. Wrap the client component in a HydrationBoundary
        // This passes the 'fetchedLocations' data into the hook's cache
        <HydrationBoundary state={dehydrate(queryClient)}>
            <LocationsClient />
        </HydrationBoundary>
    );
}
