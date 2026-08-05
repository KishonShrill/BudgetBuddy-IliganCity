import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ProductItem } from '@/components/parts/ProductCard'; // Import the interface we made earlier

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchListings = (token: string | undefined, totalItems = 0) => {
    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

    return useQuery({
        queryKey: ['fetchedListings_Admin', totalItems, token],
        queryFn: async () => {
            if (!token) throw new Error("No token provided");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: totalItems > 0 ? { limit: totalItems } : {}
            };

            const response = await axios.get<ProductItem[]>(DATABASE_URL, config);
            return response.data;
        },
        gcTime: 1000 * 60 * 5,   // Formerly cacheTime
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
        enabled: !!token,        // Don't fetch if there's no token
    });
};

export default useFetchListings;
