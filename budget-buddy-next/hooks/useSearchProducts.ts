import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const BASE_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products`;

export interface CatalogProduct {
    _id: string;
    product_id: string;
    product_name: string;
    imageUrl?: string;
    category?: {
        list?: string;
        name?: string;
        catalog?: string;
    };
}

/**
 * Hook to search catalog products across all store locations.
 * Searches against product_name, product_id, and category.
 */
export const useSearchProducts = (searchQuery: string) => {
    const trimmed = searchQuery.trim();

    return useQuery({
        queryKey: ['searchProducts', trimmed],
        queryFn: async (): Promise<CatalogProduct[]> => {
            if (!trimmed) return [];
            const response = await axios.get<CatalogProduct[]>(
                `${BASE_URL}/search?q=${encodeURIComponent(trimmed)}`
            );
            return response.data || [];
        },
        enabled: trimmed.length >= 2,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

export default useSearchProducts;
