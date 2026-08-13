import { useQuery } from '@tanstack/react-query'; // Updated import
import axios from 'axios';
import Cookies from 'universal-cookie';
import { ResultAsync } from 'neverthrow';

const cookies = new Cookies();

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchPendingContributions = () => {
    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions/pending`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions/pending`;

    const fetchURL = async () => {
        const result = await ResultAsync.fromPromise(
            axios.get(DATABASE_URL, {
                headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
            }),
            (error: any) => {
                return new Error(error.response?.data?.message || "Failed to connect to the server.");
            }
        );

        if (result.isErr()) {
            throw result.error;
        }

        return result.value.data;
    };

    return useQuery({
        queryKey: ['pendingContributions_User'],
        queryFn: fetchURL,
        gcTime: 1000 * 60 * 5, // Note: 'cacheTime' is renamed to 'gcTime' in v5
        staleTime: 1000 * 60 * 2, // 2 mins
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export default useFetchPendingContributions;
