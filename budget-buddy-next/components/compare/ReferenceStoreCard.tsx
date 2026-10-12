"use client";

import React from "react";
import { Store, MapPin, AlertCircle, Sparkles, Check, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrownBadge from "@/components/compare/CrownBadge";
import { mongoDateToText } from "@/helpers/date";
import type { ProductItem } from "@/components/parts/ProductCard";

interface ReferenceStoreCardProps {
    listing?: ProductItem | null;
    storeName?: string;
    lowestPrice?: number | null;
    lowestStoreName?: string;
    onAddToCart?: (listing: ProductItem) => void;
    isInCart?: boolean;
}

export const ReferenceStoreCard: React.FC<ReferenceStoreCardProps> = ({
    listing,
    storeName = "Selected Store",
    lowestPrice = null,
    lowestStoreName,
    onAddToCart,
    isInCart = false,
}) => {
    const isAvailableAtStore = Boolean(listing);
    const storePrice = listing?.updated_price;
    const isLowest =
        typeof storePrice === "number" &&
        lowestPrice !== null &&
        Math.abs(storePrice - lowestPrice) < 0.01;

    const priceDifference =
        typeof storePrice === "number" && lowestPrice !== null
            ? storePrice - lowestPrice
            : 0;

    return (
        <div className="w-full bg-linear-to-r from-orange-50/80 via-white to-amber-50/50 dark:from-orange-950/20 dark:via-gray-900 dark:to-amber-950/10 rounded-2xl border-2 border-orange-200 dark:border-orange-800/80 p-4 sm:p-5 shadow-sm mb-6 transition-all">
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500 text-white shadow-xs">
                    <Store className="w-3.5 h-3.5" />
                    Reference Store (Your Starting Store)
                </span>

                {isLowest && isAvailableAtStore && (
                    <CrownBadge label="Best Price Here!" />
                )}
            </div>

            {isAvailableAtStore && listing ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                            {listing.location.name || storeName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated: {mongoDateToText(listing.date_updated)}
                            </span>
                            {listing.shelf && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Shelf {listing.shelf}
                                </span>
                            )}
                        </div>

                        {/* Analysis statement */}
                        <div className="mt-2 text-xs">
                            {isLowest ? (
                                <p className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Great news! Your store currently offers the lowest price for this item.
                                </p>
                            ) : priceDifference > 0 ? (
                                <p className="text-amber-800 dark:text-amber-300 font-medium">
                                    ⚠️ Price here is <span className="font-bold">₱{priceDifference.toFixed(2)} higher</span> than the lowest store
                                    {lowestStoreName && ` (${lowestStoreName.split(" - ")[0]})`}. See alternative stores below.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-orange-100 dark:border-gray-800">
                        <div className="flex flex-col sm:items-end">
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Price
                            </span>
                            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                                ₱{storePrice?.toFixed(2)}
                            </span>
                        </div>

                        {onAddToCart && (
                            <Button
                                onClick={() => onAddToCart(listing)}
                                className={`cursor-pointer rounded-xl font-semibold gap-1.5 transition-all ${isInCart
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-[#ee4d2d] hover:bg-[#d63916] text-white shadow-sm"
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
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 py-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">
                        This product is not currently listed at your selected store. Check the alternative stores below to find where it is in stock!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReferenceStoreCard;
