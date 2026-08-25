import { useQuery } from '@tanstack/react-query';
import axios from 'axios'

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchProduct = (productId: string | null) => {
    const DATBASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products/${productId}`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products/${productId}`;

    const fetchURL = () => {
        return axios.get(DATBASE_URL);
    }

    return useQuery({
        queryKey: ["fetchedItemForEdit", productId],
        queryFn: fetchURL,
        gcTime: 1000 * 60 * 5,// int - keeps the data longer
        staleTime: 1000 * 60 * 2, // staleTime: int - default is 0 sec
        refetchOnWindowFocus: false, //boolean or 'always' - self explanatory
        enabled: !!productId, // - will control for automatic fetch
        select: (res) => res.data,
    })
}

export default useFetchProduct;
