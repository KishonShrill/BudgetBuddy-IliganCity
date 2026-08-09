import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Next.js environment variables use the NEXT_PUBLIC_ prefix
const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchProducts = (token?: string) => {
    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products`;

    const fetchProducts = async () => {
        const response = await axios.get(DATABASE_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Return data directly, replacing the need for the `select` option
        return response.data;
    };

    return useQuery({
        queryKey: ['fetchedProducts_Admin'],
        queryFn: fetchProducts,

        // cacheTime was renamed to gcTime in v5
        gcTime: 1000 * 60 * 5,    // 5 minutes
        staleTime: 1000 * 60 * 1, // 1 minute

        refetchOnWindowFocus: false,

        // Only run the query if a token actually exists to prevent 401 errors
        enabled: !!token,
    });
};

export default useFetchProducts;
