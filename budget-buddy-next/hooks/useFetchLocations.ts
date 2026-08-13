import { useQuery } from '@tanstack/react-query';
import axios from 'axios'

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchLocations = () => {
    const DATBASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/locations`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/locations`;

    const fetchURL = async () => {
        const res = await axios.get(DATBASE_URL);
        return res.data;
    }

    return useQuery({
        queryKey: ['fetchedLocations'],
        queryFn: fetchURL,
        gcTime: 1000 * 60 * 5,// int - keeps the data longer
        staleTime: 1000 * 60 * 2,// int - keeps the data longer
        refetchOnWindowFocus: false,//boolean or 'always' - self explanatory
        retry: false,
    })
}
export default useFetchLocations

