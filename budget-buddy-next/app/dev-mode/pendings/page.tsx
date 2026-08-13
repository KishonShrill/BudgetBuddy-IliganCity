"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query'; // v5 Syntax
import Cookies from 'universal-cookie';

import Header from '@/components/console/Header';
import DataTable from '@/components/parts/DataTable';
import useFetchPendingContributions from '@/hooks/useFetchPendingContributions';
import { useToast } from '@/components/ToastProvider';

// Uncomment these if you restore the delete functionality
// import { ResultAsync } from 'neverthrow';
// import axios from 'axios';

// const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
// const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
// const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

// Custom columns adapted for Pending Contributions
const columns = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'price', label: 'Reported Price', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'votes', label: 'Votes (Up/Down)' },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: "Actions" }
];

const cookies = new Cookies();

// TypeScript Interface for the pending data shape
interface PendingItem {
    _id: string;
    name: string;
    price: number;
    category: { catalog: string };
    location: { name: string };
    upvotes: number;
    downvotes: number;
    status: string;
}


export default function PendingListings() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const [isMounted, setIsMounted] = useState(false);
    const [decodedUser, setDecodedUser] = useState<any>(null);

    const token = cookies.get("budgetbuddy_token");

    useEffect(() => {
        setIsMounted(true);
        if (token) {
            try {
                setDecodedUser(jwtDecode(token));
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, [token]);

    // Note: ensure useFetchPendingContributions hook can accept undefined tokens gracefully
    const { data = { pending: [], votesToday: 0, submissionsToday: 0 }, isLoading } = useFetchPendingContributions();
    const contributions = data.pending;

    // Normalizing the pending document data for the DataTable
    const normalizedData = useMemo(() => {
        if (!contributions) return [];
        return contributions.map((item: PendingItem) => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            category: item.category?.catalog,
            location: item.location?.name,
            votes: `👍 ${item.upvotes || 0} | 👎 ${item.downvotes || 0}`,
            status: item.status,
        }));
    }, [contributions]);

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] });
        router.push("/");
    };

    // Instead of adding a product, an admin might want to manually refresh the queue
    function refresh_queue() {
        queryClient.invalidateQueries({ queryKey: ['fetchedPendingListings_Admin'] });
        addToast("Refreshed", "Pending queue updated.", "success");
    }

    // Edit allows admin to step in and fix typos before approving
    // function edit_pending(pendingId: string) {
    //     // Next.js relative routing works dynamically across environments
    //     router.push(`/dev-mode/pending/edit?pendingId=${pendingId}&type=edit&populated=true`);
    // }

    // const delete_pending = async (item: any) => {
    //     if (!window.confirm("Are you sure you want to permanently delete this pending submission?")) {
    //         return;
    //     }
    //
    //     const deleteUrl = DEVELOPMENT
    //         ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions/${item._id}`
    //         : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions/${item._id}`;
    //
    //     await ResultAsync
    //         .fromPromise(
    //             axios.delete(deleteUrl, {
    //                 headers: {
    //                     Authorization: `Bearer ${cookies.get("budgetbuddy_token")}`
    //                 }
    //             }),
    //             (error: any) => error.response?.data?.message || "Failed to delete pending submission."
    //         )
    //         .match(
    //             () => {
    //                 queryClient.setQueryData(["fetchedPendingListings_Admin"], (oldData: any) => {
    //                     if (!oldData) return [];
    //                     // Ensure we filter exactly how your oldData is structured
    //                     const dataArray = Array.isArray(oldData) ? oldData : (oldData.data || oldData.pending || []);
    //                     return dataArray.filter((pending: any) => pending._id !== item._id);
    //                 });
    //                 addToast("Deleted", `Submission for ${item.name} removed.`, "success");
    //             },
    //             (errorMessage) => {
    //                 console.error("Delete failed:", errorMessage);
    //                 addToast("Error", errorMessage, "destructive");
    //             }
    //         );
    // };

    if (!isMounted) return null;

    return (
        <>
            <title>BB:Console - Pending Contributions</title>
            <div className="flex-1 overflow-auto bg-gray-50 h-full min-w-[320px]">
                <Header
                    title="Pending Contributions"
                    actionLabel="Refresh Queue"
                    onAction={refresh_queue}
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <h1 className="text-xl font-bold text-gray-500">Loading submissions<span className="animated-dots"></span></h1>
                        : <DataTable
                            data={normalizedData}
                            columns={columns}
                            // Allows admins to quickly filter by approved, pending, rejected, or category
                            filterableColumns={['category', 'status', 'location']}
                        // onEdit={edit_pending}
                        // onDelete={delete_pending}
                        />
                    }
                </div>
            </div>
        </>
    );
}
