import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ProductItem } from '@/components/parts/ProductCard';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const BASE_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

/**
 * Fetches all store listings for a specific product.
 * The endpoint returns listings sorted by price ascending (cheapest first).
 */
export const useProductListings = (productId: string) => {
    return useQuery({
        queryKey: ['productListings', productId],
        queryFn: async (): Promise<ProductItem[]> => {
            if (!productId) return [];
            const response = await axios.get<ProductItem[]>(
                `${BASE_URL}/product/${encodeURIComponent(productId)}`
            );
            return response.data;
        },
        enabled: Boolean(productId),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

export default useProductListings;
