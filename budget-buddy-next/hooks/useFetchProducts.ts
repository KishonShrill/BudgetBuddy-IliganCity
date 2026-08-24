import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
        return response.data;
    };

    return useQuery({
        queryKey: ['fetchedProducts_Admin'],
        queryFn: fetchProducts,
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
};

export default useFetchProducts;
