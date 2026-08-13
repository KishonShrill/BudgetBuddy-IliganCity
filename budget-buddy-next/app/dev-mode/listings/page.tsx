"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query'; // Updated for v5
import { Search, Package, Loader2, CheckCircle2 } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import Cookies from 'js-cookie';
import axios from 'axios';

import Header from '@/components/console/Header';
import DataTable from '@/components/parts/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import useFetchListings from '@/hooks/useFetchListings';
import useFetchProducts from '@/hooks/useFetchProducts';
import { useToast } from '@/components/ToastProvider'; // Replaced useOutletContext

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const columns = [
    { key: 'date', label: 'Updated', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'has_image', label: 'Image', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions' },
];

// --- TypeScript Interfaces ---
interface Product {
    _id?: string;
    product_id: string;
    product_name: string;
    imageUrl?: string;
    category?: {
        name: string;
        list: string;
    };
}

interface ListingItem {
    _id: string;
    date_updated: string;
    updated_price: number;
    shelf?: string;
    product: Product;
    category: {
        list: string;
    };
    location: {
        id: string;
        name: string;
    };
}

export default function Listings() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const [isMounted, setIsMounted] = useState(false);
    const [decodedUser, setDecodedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    const token = Cookies.get("budgetbuddy_token");
    const { isLoading, data } = useFetchListings(token);
    const { data: productsData, isLoading: productsLoading } = useFetchProducts(token);

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
        return data.map((item: any) => ({
            _id: item._id,
            date: item.date_updated.split('T')[0],
            name: item.product.product_name,
            category: `${item.category.list}`,
            location: item.location.name,
            price: item.updated_price,
            has_image: item.product.imageUrl ? "yes" : "no",
            status: item.shelf,
        }));
    }, [data]);

    const logout = () => {
        Cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] });
        router.push("/");
    };

    const delete_listing = async (item: any) => {
        if (!window.confirm("Are you sure you want to permanently delete this listing?")) {
            return;
        }

        const deleteUrl = DEVELOPMENT
            ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings/${item._id}`
            : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings/${item._id}`;

        await ResultAsync
            .fromPromise(
                axios.delete(deleteUrl, {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error: any) => error.response?.data?.message || "Failed to delete listing."
            )
            .match(
                (response) => {
                    queryClient.setQueryData(["fetchedListings_Admin"], (oldData: any) => {
                        if (!oldData) return [];
                        const dataArray = Array.isArray(oldData.data) ? oldData.data : oldData;
                        const filtered = dataArray.filter((listing: ListingItem) => listing._id !== item._id);

                        return oldData.data ? { ...oldData, data: filtered } : filtered;
                    });
                    addToast("Deleted", `Listing ${item.name} from ${item.location} removed.`, "success");
                },
                (errorMessage) => {
                    console.error("Delete failed:", errorMessage);
                    addToast("Error", errorMessage, "destructive");
                }
            );
    };

    const edit_listing = (itemId: string) => {
        // 1. Find the full, un-normalized listing from the original fetched data
        const originalListing = data?.find((l: any) => l._id === itemId);

        if (!originalListing) {
            addToast("Error", "Could not find listing details.", "destructive");
            return;
        }

        // 2. Reconstruct the "baseProduct"
        const baseProduct = {
            _id: originalListing.product.product_id, // We use product_id as the dictionary key in the form
            product_id: originalListing.product.product_id,
            product_name: originalListing.product.product_name,
            imageUrl: originalListing.product.imageUrl,
            category: originalListing.category
        };

        // 3. Store payload in sessionStorage instead of React Router state
        const transferPayload = {
            baseProducts: [baseProduct],
            populated: true,
            isEdit: true,
            isBulk: false,
            listingId: originalListing._id,
            existingPrice: originalListing.updated_price,
            existingLocationId: originalListing.location.id
        };
        sessionStorage.setItem('listing_transfer_data', JSON.stringify(transferPayload));

        // 4. Navigate
        router.push('/dev-mode/listings/new');
    };

    // Filter products based on search bar inside the modal
    const filteredProducts = useMemo(() => {
        const rawProducts = Array.isArray(productsData) ? productsData : productsData?.data || [];
        if (!searchTerm) return rawProducts;

        return rawProducts.filter((p: Product) =>
            p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.product_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [productsData, searchTerm]);

    const handleSelectProduct = (selectedProduct: Product) => {
        if (isBulkMode) {
            // Toggle selection
            setSelectedProducts(prev => {
                const isSelected = prev.find(p => p._id === selectedProduct._id);
                if (isSelected) return prev.filter(p => p._id !== selectedProduct._id);
                return [...prev, selectedProduct];
            });
        } else {
            // Original single-select behavior
            setIsModalOpen(false);

            const transferPayload = { baseProducts: [selectedProduct], populated: true, isBulk: false };
            sessionStorage.setItem('listing_transfer_data', JSON.stringify(transferPayload));

            router.push('/dev-mode/listings/new');
        }
    };

    const handleProceedBulk = () => {
        setIsModalOpen(false);

        const transferPayload = { baseProducts: selectedProducts, populated: true, isBulk: true };
        sessionStorage.setItem('listing_transfer_data', JSON.stringify(transferPayload));

        router.push('/dev-mode/listings/new');
    };

    // Prevent hydration mismatch
    if (!isMounted) return null;

    return (
        <>
            <title>BB:Console - Listings</title>
            <div className="flex-1 overflow-auto bg-gray-50 h-full min-w-[320px]">
                <Header
                    title="Listings"
                    actionLabel="Add Listing"
                    onAction={() => setIsModalOpen(true)}
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <h1 className="text-xl font-bold text-gray-500">Loading listings<span className="animated-dots"></span></h1>
                        : <DataTable
                            data={normalizedData}
                            columns={columns}
                            filterableColumns={['category', 'location', 'status', 'has_image']}
                            onDelete={delete_listing}
                            onEdit={edit_listing}
                        />
                    }
                </div>
            </div>

            {/* --- PRODUCT SELECTION MODAL --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-y-0 overflow-hidden bg-white">

                    {/* Header Controls */}
                    <div className="px-6 pt-6 pb-4 border-b flex justify-between items-center">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Select Product(s)</DialogTitle>
                            <DialogDescription>
                                {isBulkMode ? "Select multiple products to price at once." : "Choose the base product you want to create a listing for."}
                            </DialogDescription>
                        </DialogHeader>
                        <Button
                            className={`bg-green-500 ${isBulkMode && 'bg-green-700 hover:bg-green-800'} text-white transition-colors`}
                            variant={isBulkMode ? "default" : "outline"}
                            onClick={() => {
                                setIsBulkMode(!isBulkMode);
                                setSelectedProducts([]); // clear on toggle
                            }}
                        >
                            {isBulkMode ? "Cancel Bulk" : "Bulk Mode"}
                        </Button>
                    </div>

                    {/* Sticky Search Bar */}
                    <div className="px-6 py-2 border-b relative bg-white">
                        <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-gray-50 border-gray-200"
                        />
                    </div>

                    {/* Scrollable Product List */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                        {productsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                                <p>Loading inventory...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No products found matching &ldquo;{searchTerm}&rdquo;</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {filteredProducts.map((product: Product) => {
                                    const isSelected = selectedProducts.some(p => p._id === product._id);

                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleSelectProduct(product)}
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all group ${isSelected
                                                ? 'bg-green-50 border-green-500 shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`h-12 w-12 rounded-md flex items-center justify-center shrink-0 overflow-hidden border ${isSelected ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-200'}`}>
                                                    {isSelected ? (
                                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                                    ) : product.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={product.imageUrl} alt={product.product_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {product.product_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 flex gap-2 mt-1">
                                                        <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                            {product.product_id}
                                                        </span>
                                                        <span className="truncate">
                                                            {product.category?.name || "Uncategorized"}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Bulk Proceed Footer */}
                    {isBulkMode && (
                        <div className="p-4 border-t bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                {selectedProducts.length} selected
                            </span>
                            <Button
                                onClick={handleProceedBulk}
                                disabled={selectedProducts.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                                Proceed to Pricing
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
