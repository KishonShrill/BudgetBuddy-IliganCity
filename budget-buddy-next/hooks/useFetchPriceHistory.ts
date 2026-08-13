import { useQuery } from '@tanstack/react-query'; // Updated import
import axios from 'axios';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const fetchPriceHistory = async (listingId: string | null) => {
    if (listingId == null) return []

    const url = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings/${listingId}`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings/${listingId}`;

    const { data } = await axios.get(url);
    return data.data || [];
};

export default function useFetchPriceHistory(listingId: string | null) {
    return useQuery({
        queryKey: ['priceHistory', listingId],
        queryFn: () => fetchPriceHistory(listingId),
        enabled: !!listingId,
        staleTime: 5 * 60 * 1000,
        retry: 1
    });
}
