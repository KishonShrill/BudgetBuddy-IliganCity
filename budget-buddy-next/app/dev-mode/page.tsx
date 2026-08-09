"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/console/Header';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';


export default function Products() {
    const router = useRouter();
    const [decodedUser, setDecodedUser] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Run this only on the client to avoid Next.js hydration errors
        setIsMounted(true);
        const token = Cookies.get("budgetbuddy_token");
        if (token) {
            try {
                setDecodedUser(jwtDecode(token));
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, []);

    const logout = () => {
        Cookies.remove("budgetbuddy_token", { path: "/" });
        router.push("/");
    };

    // Don't render the UI until the client has mounted and checked cookies
    if (!isMounted) return null;

    return (
        <>
            {/* Next.js 14+ automatically hoists this to the document <head> */}
            <title>BB:Console - Dashboard</title>

            <div className="flex-1 overflow-auto bg-gray-50 h-full min-w-[320px]">
                <Header
                    title="Dashboard"
                    actionLabel="Logout"
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 md:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {/* Dashboard content goes here */}
                </div>
            </div>
        </>
    );
}
