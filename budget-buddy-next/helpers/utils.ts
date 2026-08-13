import axios from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 1. The shadcn/ui Tailwind merger
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 2. The POST wrapper (Upgraded with TypeScript Generics!)
// T = The type of data you are sending
// R = The type of response you expect back
export const postData = async <T, R = any>(url: string, data: T): Promise<R> => {
    try {
        // We tell Axios what kind of response to expect
        const response = await axios.post<R>(url, data);
        return response.data;
    } catch (error) {
        console.error("Error posting data:", error);
        // In TypeScript, it's often better to just throw the error 
        // so TanStack Query's `onError` callback can catch it!
        throw error;
    }
};
