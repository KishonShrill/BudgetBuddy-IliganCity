import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useFetchConsoleUsers = (token?: string) => {
    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/users`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/users`;

    const fetchUsers = async () => {
        const response = await axios.get(DATABASE_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.users || response.data || [];
    };

    return useQuery({
        queryKey: ['console_users'],
        queryFn: fetchUsers,
        gcTime: 1000 * 60 * 5,    // 5 minutes
        staleTime: 1000 * 60 * 1, // 1 minute
        refetchOnWindowFocus: false,
        enabled: !!token,
    });
};

export default useFetchConsoleUsers;
