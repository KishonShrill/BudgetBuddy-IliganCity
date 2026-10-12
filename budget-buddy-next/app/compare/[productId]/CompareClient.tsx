"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";

import { RootState } from "@/redux/store";
import { addToCart } from "@/redux/cartSlice";
import { useToast } from "@/components/ToastProvider";
import useProductListings from "@/hooks/useProductListings";

import CompareHeader from "@/components/compare/CompareHeader";
import ReferenceStoreCard from "@/components/compare/ReferenceStoreCard";
import StoreList from "@/components/compare/StoreList";
import { Button } from "@/components/ui/button";
import type { ProductItem } from "@/components/parts/ProductCard";

interface CompareClientProps {
    productId: string;
}

export default function CompareClient({ productId }: CompareClientProps) {
    const searchParams = useSearchParams();
    const storeParam = searchParams.get("store") || null;

    const dispatch = useDispatch();
    const { addToast } = useToast();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const cartItemIds = useMemo(() => new Set(Object.keys(cartItems)), [cartItems]);

    const { data: rawListings, isLoading, isError, error } = useProductListings(productId);

    // Normalize listings sorted ascending by price
    const listings: ProductItem[] = useMemo(() => {
        if (!rawListings || !Array.isArray(rawListings)) return [];
        return [...rawListings].sort((a, b) => (a.updated_price || 0) - (b.updated_price || 0));
    }, [rawListings]);

    // Product metadata (from the first available listing)
    const primaryListing = listings[0] || null;
    const productName = primaryListing?.product?.product_name || decodeURIComponent(productId);
    const imageUrl = primaryListing?.product?.imageUrl;
    const category = primaryListing?.category?.catalog;

    // Lowest price across all stores
    const lowestPrice = listings.length > 0 ? listings[0].updated_price : null;
    const lowestStoreName = listings.length > 0 ? listings[0].location?.name : undefined;

    // Reference store listing (if ?store= param provided)
    const referenceListing = useMemo(() => {
        if (!storeParam || listings.length === 0) return null;
        return (
            listings.find(
                (l) => l.location?.id === storeParam || l.location?.name === storeParam
            ) || null
        );
    }, [storeParam, listings]);

    // Other stores to compare against
    const otherListings = useMemo(() => {
        if (!storeParam) return listings;
        return listings.filter(
            (l) => l.location?.id !== storeParam && l.location?.name !== storeParam
        );
    }, [storeParam, listings]);

    const handleAddToCart = (listing: ProductItem) => {
        if (!listing) return;

        dispatch(
            addToCart({
                id: listing._id,
                name: listing.product.product_name,
                price: listing.updated_price,
                location: listing.location.name,
                image: listing.product.imageUrl || "",
            })
        );

        addToast(
            "Added to cart",
            `${listing.product.product_name} from ${listing.location.name.split(" - ")[0]}`,
            "success"
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Finding prices across Iligan City stores...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[60vh] max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Failed to load price comparison
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {error instanceof Error ? error.message : "An unexpected error occurred."}
                </p>
                <Link href="/locations">
                    <Button variant="outline">Back to Stores</Button>
                </Link>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="min-h-[60vh] max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    No store listings found
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    We could not find active prices for &quot;{productName}&quot; across local stores.
                </p>
                <div className="flex justify-center gap-3">
                    <Link href="/locations">
                        <Button variant="outline">Browse Stores</Button>
                    </Link>
                    <Link href="/compare">
                        <Button className="bg-[#ee4d2d] hover:bg-[#d63916] text-white">
                            Search Another Product
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100dvh-65px)] bg-gray-50 dark:bg-gray-950 py-6 px-4 sm:px-6 transition-colors">
            <div className="max-w-4xl mx-auto">
                {/* Product Comparison Header */}
                <CompareHeader
                    productName={productName}
                    imageUrl={imageUrl}
                    category={category}
                    listings={listings}
                    backHref={storeParam ? `/locations/${storeParam}` : "/locations"}
                />

                {/* Reference Store Card (Pinned at top if ?store= parameter provided) */}
                {storeParam && (
                    <ReferenceStoreCard
                        listing={referenceListing}
                        storeName="Selected Store"
                        lowestPrice={lowestPrice}
                        lowestStoreName={lowestStoreName}
                        onAddToCart={handleAddToCart}
                        isInCart={referenceListing ? cartItemIds.has(referenceListing._id) : false}
                    />
                )}

                {/* Other Stores List (Sorted by lowest price with crown on lowest) */}
                <StoreList
                    listings={otherListings}
                    lowestPrice={lowestPrice}
                    referencePrice={referenceListing?.updated_price ?? null}
                    referenceStoreId={storeParam}
                    cartItemIds={cartItemIds}
                    onAddToCart={handleAddToCart}
                    title={storeParam ? "Alternative Store Prices" : "All Store Prices"}
                />

                {/* Bottom navigation link */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <Link
                        href={storeParam ? `/locations/${storeParam}` : "/locations"}
                        className="inline-flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Return to {storeParam ? "store catalog" : "stores"}</span>
                    </Link>
                    <Link
                        href="/compare"
                        className="hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
                    >
                        Compare another product →
                    </Link>
                </div>
            </div>
        </div>
    );
}
