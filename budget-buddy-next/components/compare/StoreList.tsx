"use client";

import React from "react";
import StoreCard from "@/components/compare/StoreCard";
import type { ProductItem } from "@/components/parts/ProductCard";

interface StoreListProps {
    listings: ProductItem[];
    lowestPrice?: number | null;
    referencePrice?: number | null;
    referenceStoreId?: string | null;
    cartItemIds?: Set<string>;
    onAddToCart: (listing: ProductItem) => void;
    title?: string;
}

export const StoreList: React.FC<StoreListProps> = ({
    listings,
    lowestPrice = null,
    referencePrice = null,
    referenceStoreId = null,
    cartItemIds = new Set(),
    onAddToCart,
    title,
}) => {
    if (listings.length === 0) {
        return (
            <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No other stores currently list this product.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {title && (
                <div className="flex items-center justify-between px-1 mb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {title}
                    </h2>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        Sorted by lowest price
                    </span>
                </div>
            )}

            <div className="space-y-3">
                {listings.map((listing) => {
                    const isReference = Boolean(
                        referenceStoreId && (listing.location?.id === referenceStoreId || listing.location?.name === referenceStoreId)
                    );
                    const isLowest =
                        lowestPrice !== null &&
                        typeof listing.updated_price === "number" &&
                        Math.abs(listing.updated_price - lowestPrice) < 0.01;

                    return (
                        <StoreCard
                            key={listing._id}
                            listing={listing}
                            isLowest={isLowest}
                            referencePrice={referencePrice}
                            isReferenceStore={isReference}
                            isInCart={cartItemIds.has(listing._id)}
                            onAddToCart={onAddToCart}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default StoreList;
