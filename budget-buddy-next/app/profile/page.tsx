"use client";

import { CheckCircle, XCircle, Award, User, ArrowLeft, Clock, LogOut, Lock } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";
import { useQueryClient, useQuery } from "@tanstack/react-query"; // Updated import
import { ResultAsync } from "neverthrow";

const cookies = new Cookies();

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
const DATABASE_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/users/me`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/users/me`;

interface User {
    "user_email": string;
    "user_role": string;
    "username": string;
    "profile_picture"?: string;
}

const ProfilePage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const cookie = cookies.get("budgetbuddy_token");

    const user: User = cookie ? jwtDecode(cookie) : { username: "Guest", user_role: "guest", user_email: "" };

    const { data: stats } = useQuery({
        // v5 requires an object with queryKey and queryFn
        queryKey: ['userStats', user.user_email],
        queryFn: async () => {
            const fetchPromise = fetch(DATABASE_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                }
            }).then(res => {
                if (!res.ok) throw new Error("Failed to fetch user stats");
                return res.json();
            });

            const result = await ResultAsync.fromPromise(
                fetchPromise,
                (error: any) => new Error(`Network fetch failed: ${error.message}`)
            );

            if (result.isErr()) {
                throw result.error;
            }

            const userData = result.value.user;
            const userStats = Array.isArray(userData) ? userData[0]?.stats : userData?.stats;

            return userStats || { points: 0, approved: 0, pending: 0, rejected: 0 };
        },
        enabled: !!cookie,
        initialData: { points: 0, approved: 0, pending: 0, rejected: 0 }
    });

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] }); // v5 syntax
        router.push("/");

        // Use Next.js native refresh instead of full window reload
        setTimeout(() => {
            router.refresh();
        }, 100);
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-4xl flex-col p-4 sm:p-6 lg:p-10">
            <div className="flex justify-between">
                {cookie && (
                    <button
                        onClick={logout}
                        className="mb-6 flex items-center gap-2 rounded-full px-4 py-2 text-white text-sm font-semibold bg-red-700 hover:bg-red-400 transition-colors"
                    >
                        <LogOut size={20} />Logout
                    </button>
                )}
                <button
                    onClick={() => router.back()}
                    className="cursor-pointer mb-6 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <ArrowLeft size={16} />Go Back?
                </button>
            </div>

            <div className="flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm relative dark:bg-gray-800 dark:border-gray-700">
                {/* Profile Header */}
                <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white dark:border-gray-800 bg-orange-100 shadow-xl">
                    {user.profile_picture ? (
                        <img src={user.profile_picture} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                        <User size={48} className="text-orange-500" />
                    )}
                </div>

                <h2 className="mt-4 sm:mt-5 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white text-center capitalize">
                    {user.username.toLowerCase()}
                </h2>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
                    {user.user_email}
                </p>
                <span className="mt-3 inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {user.user_role}
                </span>

                {/* Stats Section */}
                {!cookie ? (
                    <div className="mt-8 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400">
                            <Lock size={32} />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Sign in to view listings</h3>
                        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">Create an account or log in to see the newest product additions and start budgeting.</p>
                        <button
                            onClick={() => router.push('/authenticate')}
                            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
                        >
                            Sign In / Register
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 sm:mt-10 w-full border-t border-gray-100 dark:border-gray-700 pt-8 sm:pt-10">
                        <h3 className="mb-6 text-center text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">Your Contributions</h3>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-6">

                            {/* Points Card */}
                            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 sm:p-6 text-white shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-1">
                                <Award size={28} className="mb-2 opacity-80 sm:h-8 sm:w-8" />
                                <span className="text-3xl sm:text-4xl font-black">{stats.points}</span>
                                <span className="mt-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90">Points</span>
                            </div>

                            {/* Approved Card */}
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-2 sm:mb-3 rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-500 dark:text-green-400">
                                    <CheckCircle size={20} className="sm:h-6 sm:w-6" />
                                </div>
                                <span className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">{stats.approved}</span>
                                <span className="mt-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Approved</span>
                                <p className="mt-1 sm:mt-2 text-center text-[9px] sm:text-[10px] leading-tight text-gray-400 hidden sm:block">Items validated by admin</p>
                            </div>

                            {/* Pending Card */}
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-2 sm:mb-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-2 text-yellow-500 dark:text-yellow-400">
                                    <Clock size={20} className="sm:h-6 sm:w-6" />
                                </div>
                                <span className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">{stats.pending}</span>
                                <span className="mt-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending</span>
                                <p className="mt-1 sm:mt-2 text-center text-[9px] sm:text-[10px] leading-tight text-gray-400 hidden sm:block">Awaiting review</p>
                            </div>

                            {/* Rejected Card */}
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-2 sm:mb-3 rounded-full bg-red-100 dark:bg-red-900/30 p-2 text-red-500 dark:text-red-400">
                                    <XCircle size={20} className="sm:h-6 sm:w-6" />
                                </div>
                                <span className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">{stats.rejected}</span>
                                <span className="mt-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Rejected</span>
                                <p className="mt-1 sm:mt-2 text-center text-[9px] sm:text-[10px] leading-tight text-gray-400 hidden sm:block">Data declined</p>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
