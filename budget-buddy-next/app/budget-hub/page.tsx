"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import { User, MapPin, Utensils, Package, ReceiptText, ServerCrash, Lock } from "lucide-react";
import Cookies from "js-cookie";
import ProductCard from "@/components/parts/ProductCard";
import PriceHistoryModal from "@/components/parts/PriceHistoryModal"; // Restored Import
import SimpleFooter from "@/components/parts/SimpleFooter";
import useFetchListings from "@/hooks/useFetchListings";

// 1. Define the shape of your decoded JWT
interface DecodedToken {
    user_id: string;
    user_email: string;
    user_role: string;
    username: string;
    profile_picture?: string;
    iat?: number; // Issued at (added automatically by jwt.sign)
    exp?: number; // Expiration time (added automatically by jwt.sign)
}

interface Listing {
    _id: string;
    [key: string]: any;
}

export default function BudgetHub() {
    const router = useRouter();
    const token = Cookies.get("budgetbuddy_token");

    const userData = useMemo(() => {
        if (!token) return { username: "Guest", profile_picture: null };
        try {
            return jwtDecode<DecodedToken>(token);
        } catch (error) {
            console.error("Invalid token", error);
            return { username: "Guest", profile_picture: null };
        }
    }, [token]);

    // RESTORED: Modal State and Handler
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

    const { data: recentListings, isLoading, isError } = useFetchListings(token, 10);

    const handleViewHistory = useCallback((item: any) => {
        setSelectedHistoryItem(item);
        setHistoryModalOpen(true);
    }, []);

    return (
        <div>
            <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col p-4 sm:p-6 lg:p-10 transition-colors duration-300">

                {/* Welcome Section */}
                <div className="flex items-center justify-between rounded-3xl bg-linear-to-r from-orange-500 to-orange-400 p-6 sm:p-8 text-white shadow-lg dark:shadow-orange-900/20" >
                    <div>
                        <p className="text-sm sm:text-base font-medium opacity-90">Welcome back,</p>
                        <h1 className="text-xl sm:text-4xl font-black tracking-tight">{userData.username}!</h1>
                    </div>
                    <Link href='/profile' className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white dark:bg-gray-800 shadow-inner hover:scale-105 transition-transform">
                        {userData.profile_picture ? (
                            <Image src={userData.profile_picture} alt="Profile" fill className="object-cover" />
                        ) : (
                            <User size={32} className="text-orange-500 dark:text-orange-400" />
                        )}
                    </Link>
                </div >

                {/* Quick Actions (Three Buttons) */}
                < div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-6" >
                    < button
                        onClick={() => router.push('/locations')
                        }
                        className="cursor-pointer group flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:hover:shadow-xl dark:hover:border-gray-600"
                    >
                        <div className="mb-2 sm:mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 text-blue-500 dark:text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                            <MapPin size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <span className="text-[10px] sm:text-sm font-bold text-gray-800 dark:text-gray-200">Groceries</span>
                    </button >

                    <button
                        disabled
                        className="cursor-not-allowed opacity-80 dark:opacity-60 group flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm"
                    >
                        <div className="mb-2 sm:mb-3 rounded-full bg-green-100 dark:bg-green-900/30 p-3 sm:p-4 text-green-500 dark:text-green-400">
                            <Utensils size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <span className="text-[10px] sm:text-sm font-bold text-gray-800 dark:text-gray-200">Cuisines</span>
                    </button>

                    <button
                        onClick={() => router.push('/receipt')}
                        className="cursor-pointer group flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:hover:shadow-xl dark:hover:border-gray-600"
                    >
                        <div className="mb-2 sm:mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 sm:p-4 text-purple-500 dark:text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-white dark:group-hover:bg-purple-500 dark:group-hover:text-white">
                            <ReceiptText size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <span className="text-[10px] sm:text-sm font-bold text-gray-800 dark:text-gray-200">Receipt</span>
                    </button>
                </div >

                {/* Top 10 Newest Listings */}
                < div className="mt-8 sm:mt-12 flex-1" >
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="max-[500px]:text-lg text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Newest Additions</h2>
                        <button onClick={() => router.push('/locations')} className="text-sm font-bold text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 hover:underline hover:cursor-pointer transition-colors">
                            View All Locations
                        </button>
                    </div>

                    {/* State 0: Not Logged In */}
                    {
                        !token ? (
                            < div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-12 text-center transition-colors" >
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                                    <Lock size={32} />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Sign in to view listings</h3>
                                <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">Create an account or log in to see the newest product additions and start budgeting.</p>
                                <button
                                    onClick={() => router.push('/authenticate')}
                                    className="cursor-pointer rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
                                >
                                    Sign In / Register
                                </button>
                            </div >
                        ) : (
                            <>
                                {/* State 1: Loading (Skeleton UI) */}
                                {isLoading && (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {[...Array(10)].map((_, i) => (
                                            < div key={i} className="flex flex-col gap-2 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm animate-pulse" >
                                                <div className="h-32 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                                            </div>
                                        ))}
                                    </div >
                                )
                                }

                                {/* State 2: Error (Server down or no internet) */}
                                {
                                    isError && !isLoading && (
                                        < div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 py-12 text-center text-red-500 transition-colors" >
                                            <ServerCrash size={48} className="mb-4 text-red-400 dark:text-red-500" />
                                            <h3 className="mb-1 text-lg font-bold">Failed to load listings</h3>
                                            <p className="text-sm text-red-400 dark:text-red-300">Please check your network connection or try again later.</p>
                                        </div >
                                    )
                                }

                                {/* State 3: Success but Empty */}
                                {
                                    !isLoading && !isError && (!recentListings || recentListings.length === 0) && (
                                        <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-12 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                            <Package size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                                            <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
                                            <p className="text-sm">We couldn&apos;t find any recent additions right now.</p>
                                        </div>
                                    )
                                }

                                {/* State 4: Success with Data */}
                                {
                                    !isLoading && !isError && recentListings && recentListings?.length > 0 && (
                                        <div className="grid max-[500px]:grid-cols-1 grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {recentListings.map((product: Listing) => (
                                                <ProductCard
                                                    key={product._id}
                                                    item={product as any}
                                                    onViewHistory={handleViewHistory} // RESTORED PROP
                                                />
                                            ))}
                                        </div>
                                    )
                                }
                            </>
                        )}
                </div >

                {/* RESTORED: Price History Modal */}
                <PriceHistoryModal
                    isOpen={historyModalOpen}
                    onClose={() => setHistoryModalOpen(false)}
                    listing={selectedHistoryItem}
                />
            </div >

            {/* Main Application Footer */}
            <SimpleFooter className="bg-gray-900 mt-6" />
        </div>
    );
}
