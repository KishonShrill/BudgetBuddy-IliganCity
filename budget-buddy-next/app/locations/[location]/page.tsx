import { Metadata } from "next";
import GroceryClient from "./GroceryClient"; // Or whatever your client component is named

// 1. DYNAMIC METADATA
// This replaces `export const metadata` so we can fetch the specific store's name for SEO
const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
const DATBASE_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/locations`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/locations`;

export async function generateMetadata({
    params
}: {
    params: Promise<{ location: string }>
}): Promise<Metadata> {
    const { location } = await params; // 'location' is the _id from the URL

    try {
        // Replace this with your actual API endpoint to fetch a single location by _id
        const res = await fetch(`${DATBASE_URL}/${location}`);
        const data = await res.json();

        // Fallback name if API fails, otherwise use the actual store name
        const storeName = data?.location_name || "Store";

        return {
            title: `${storeName} - Budget Buddy`,
            description: `Browse products and track your shopping budget at ${storeName}.`,
        };
    } catch (error) {
        return {
            title: "Store - Budget Buddy",
            description: "Browse products and track your shopping budget in real-time.",
        };
    }
}

// 2. GENERATE STATIC PARAMS
// This tells Next.js which IDs to pre-build into static HTML files
export async function generateStaticParams() {
    try {
        // Replace with your actual API endpoint that gets ALL locations
        // Note: You must fetch this directly, you cannot use your client-side `useFetchLocations` hook here.
        const res = await fetch(DATBASE_URL);
        const locations = await res.json();

        // Map the data to return an array of objects where the key matches your folder name [location]
        return locations.map((loc: { _id: string }) => ({
            location: loc._id.toString(),
        }));
    } catch (error) {
        console.error("Failed to fetch locations for static params:", error);
        return []; // Fallback to empty array, Next.js will generate pages on-demand instead
    }
}

// 3. THE SERVER COMPONENT PAGE
export default async function LocationPage({
    params
}: {
    params: Promise<{ location: string }>
}) {
    const { location } = await params;

    // Pass the _id to your client component where your interactive logic lives
    return <GroceryClient locationId={location} />;
}
