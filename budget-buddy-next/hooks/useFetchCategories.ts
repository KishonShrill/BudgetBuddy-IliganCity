import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchCategories = () => {
    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/categories`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/categories`;

    const fetchCategories = async () => {
        const response = await axios.get(DATABASE_URL);
        return response.data;
    };

    return useQuery({
        queryKey: ['fetchedCategories_Admin'],
        queryFn: fetchCategories,
        gcTime: 1000 * 60 * 5,    // 5 minutes
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
        enabled: true,
    });
};

export default useFetchCategories;
