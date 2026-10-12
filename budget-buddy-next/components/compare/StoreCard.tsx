"use client";

import React from "react";
import { Store, MapPin, Clock, Plus, Check, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrownBadge from "@/components/compare/CrownBadge";
import { mongoDateToText } from "@/helpers/date";
import type { ProductItem } from "@/components/parts/ProductCard";

interface StoreCardProps {
    listing: ProductItem;
    isLowest?: boolean;
    referencePrice?: number | null;
    isReferenceStore?: boolean;
    onAddToCart: (listing: ProductItem) => void;
    isInCart?: boolean;
}

export const StoreCard: React.FC<StoreCardProps> = ({
    listing,
    isLowest = false,
    referencePrice = null,
    isReferenceStore = false,
    onAddToCart,
    isInCart = false,
}) => {
    const productName = listing.product?.product_name;
    const storeName = listing.location?.name || "Unknown Store";
    const price = listing.updated_price;

    // Calculate difference vs reference store
    let diffBadge: React.ReactNode = null;
    if (referencePrice !== null && !isReferenceStore && typeof price === "number") {
        const diff = price - referencePrice;
        if (diff < -0.01) {
            diffBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ArrowDownRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ₱{Math.abs(diff).toFixed(2)} cheaper
                </span>
            );
        } else if (diff > 0.01) {
            diffBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <ArrowUpRight className="w-3 h-3 text-gray-500" />
                    +₱{diff.toFixed(2)} vs selected
                </span>
            );
        } else {
            diffBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    Same price
                </span>
            );
        }
    }

    return (
        <div
            className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${isLowest
                ? "bg-amber-50/40 dark:bg-amber-950/15 border-amber-300 dark:border-amber-800/80 shadow-sm"
                : isReferenceStore
                    ? "bg-orange-50/30 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/60 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-xs"
                }`}
        >
            {/* Store Information */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {isLowest && <CrownBadge />}
                    {isReferenceStore && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-200 border border-orange-300 dark:border-orange-800">
                            Your Selected Store
                        </span>
                    )}
                    {diffBadge}
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Store className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
                            {storeName}
                        </h3>
                        <p className="text-gray-500 leading-snug">
                            {productName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {mongoDateToText(listing.date_updated)}
                            </span>
                            {listing.shelf && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Shelf {listing.shelf}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Price & Action Section */}
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:items-end">
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Price
                    </span>
                    <span
                        className={`text-2xl font-black ${isLowest
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-orange-600 dark:text-orange-400"
                            }`}
                    >
                        ₱{price?.toFixed(2)}
                    </span>
                </div>

                <Button
                    onClick={() => onAddToCart(listing)}
                    className={`cursor-pointer rounded-xl font-semibold gap-1.5 transition-all ${isInCart
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[#ee4d2d] hover:bg-[#d63916] text-white shadow-sm hover:shadow-md"
                        }`}
                >
                    {isInCart ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>In Cart</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            <span>Add to Cart</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default StoreCard;
