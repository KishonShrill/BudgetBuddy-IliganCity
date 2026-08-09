"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { ResultAsync } from 'neverthrow';
import { useQueryClient } from '@tanstack/react-query'; // Updated import for v5
import Header from '@/components/console/Header';
import DataTable from '@/components/parts/DataTable';
import Cookies from 'js-cookie';
import useFetchProducts from '@/hooks/useFetchProducts';
import axios from 'axios';
import { useToast } from '@/components/ToastProvider';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const columns = [
    { key: 'product_id', label: 'Item ID', sortable: true },
    { key: 'product_name', label: 'Product Name', sortable: true },
    { key: 'category_name', label: 'Category', sortable: true },
    { key: 'category_list', label: 'Section', sortable: true },
    { key: 'has_image', label: 'Image' },
    { key: 'actions', label: "Actions" }
];

// Define TypeScript interfaces for the data
interface Category {
    list: string;
    name: string;
}

interface Product {
    _id: string;
    product_id: string;
    product_name: string;
    imageUrl?: string;
    category: Category;
}

export default function Products() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { addToast } = useToast(); // Replaced useOutletContext

    const [isMounted, setIsMounted] = useState(false);
    const [decodedUser, setDecodedUser] = useState<any>(null);
    const token = Cookies.get("budgetbuddy_token");

    const { isLoading, data } = useFetchProducts(token);

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

    const normalizedData = useMemo(() => {
        if (!data) return [];
        return data.map((item: Product) => ({
            _id: item._id,
            product_id: item.product_id,
            product_name: item.product_name,
            has_image: item.imageUrl ? "yes" : "no",
            category_list: item.category?.list,
            category_name: item.category?.name
        }));
    }, [data]);

    const logout = () => {
        Cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] });
        router.push("/");
    };

    function add_product() {
        // Next.js doesn't support route state, use URL query parameters instead
        router.push('/dev-mode/products/new?populated=true');
    }

    function edit_product(productId: string) {
        // Replaced hardcoded localhost/vercel URLs with a clean relative path
        router.push(`/dev-mode/products/edit?productId=${productId}&type=edit&populated=true`);
    }

    const delete_product = async (item: any) => {
        if (!window.confirm("Are you sure you want to permanently delete this product?")) {
            return;
        }

        const deleteUrl = DEVELOPMENT
            ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products/${item._id}`
            : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products/${item._id}`;

        await ResultAsync
            .fromPromise(
                axios.delete(deleteUrl, {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error: any) => error.response?.data?.message || "Failed to delete product."
            )
            .match(
                (response) => {
                    // Update cache optimistically
                    queryClient.setQueryData(["fetchedProducts_Admin"], (oldData: any) => {
                        if (!oldData) return [];
                        // Depending on your hook's return structure, adjust this filter logic
                        const dataArray = Array.isArray(oldData.data) ? oldData.data : oldData;
                        const filtered = dataArray.filter((product: Product) => product._id !== item._id);

                        return oldData.data ? { ...oldData, data: filtered } : filtered;
                    });
                    addToast("Deleted", `Product ${item.product_name} removed.`, "success");
                },
                (errorMessage) => {
                    console.error("Delete failed:", errorMessage);
                    addToast("Error", errorMessage, "destructive");
                }
            );
    };

    if (!isMounted) return null;

    return (
        <>
            {/* Hoisted to document <head> by Next.js */}
            <title>BB:Console - Products</title>

            <div className="flex-1 overflow-auto bg-gray-50 h-full min-w-[320px]">
                <Header
                    title="Products"
                    actionLabel="Add Product"
                    onAction={add_product}
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <h1 className="text-xl font-bold text-gray-500">Loading products<span className="animated-dots"></span></h1>
                        : <DataTable
                            fetched="products"
                            data={normalizedData}
                            columns={columns}
                            filterableColumns={['category_name', 'category_list', 'status']}
                            onEdit={edit_product}
                            onDelete={delete_product}
                        />
                    }
                </div>
            </div>
        </>
    );
}
