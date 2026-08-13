import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ResultAsync } from 'neverthrow';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchListingsByLocation = (location: string | null) => {
    const DATBASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/locations/${location}`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/locations/${location}`;

    const fetchURL = async () => {
        const result = await ResultAsync.fromPromise(
            axios.get(DATBASE_URL),
            (error: unknown) => {
                if (axios.isAxiosError(error)) {
                    return new Error(error.response?.data?.message || "Failed to fetch data.")
                }
                return new Error(error instanceof Error ? error.message : "An unexpected error occurred.");
            }
        );

        if (result.isErr()) {
            throw result.error;
        }

        return result.value.data;
    };

    return useQuery({
        queryKey: ['fetchedListingsByLocation', location],
        queryFn: fetchURL,
        gcTime: 1000 * 60 * 5,// int - keeps the data longer
        staleTime: 1000 * 60 * 2, // staleTime: int - default is 0 sec
        refetchOnWindowFocus: false,//boolean or 'always' - self explanatory
        enabled: !!location, // 🟢 Only run if location exists
    })
}
export default useFetchListingsByLocation;

