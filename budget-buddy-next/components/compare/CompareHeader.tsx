"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Sparkles, Tag, Store, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductItem } from "@/components/parts/ProductCard";

interface CompareHeaderProps {
    productName: string;
    imageUrl?: string;
    category?: string;
    listings?: ProductItem[];
    backHref?: string;
}

export const CompareHeader: React.FC<CompareHeaderProps> = ({
    productName,
    imageUrl,
    category,
    listings = [],
    backHref = "/locations",
}) => {
    // Calculate price statistics
    const prices = listings.map((l) => l.updated_price).filter((p) => typeof p === "number" && !isNaN(p));
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : null;
    const maxSavings = lowestPrice !== null && highestPrice !== null ? highestPrice - lowestPrice : 0;
    const lowestStore = listings.find((l) => l.updated_price === lowestPrice)?.location?.name;

    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm mb-6 transition-colors">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-4">
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to shopping</span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/compare"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Search another</span>
                    </Link>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Store className="w-3.5 h-3.5" />
                        <span>{listings.length} {listings.length === 1 ? "store" : "stores"} compared</span>
                    </span>
                </div>
            </div>

            {/* Product Info Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={productName}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-orange-950/30">
                            <Package className="w-8 h-8 text-orange-400" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                            Price Comparison
                        </span>
                        {category && (
                            <Badge variant="outline" className="text-[11px] font-normal gap-1">
                                <Tag className="w-3 h-3" />
                                {category}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                        {productName}
                    </h1>

                    {/* Price Range & Savings Banner */}
                    {lowestPrice !== null && (
                        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1.5">Price range:</span>
                                <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100">
                                    ₱{lowestPrice.toFixed(2)}
                                </span>
                                {highestPrice !== null && highestPrice > lowestPrice && (
                                    <span className="text-base sm:text-lg font-extrabold text-gray-500 dark:text-gray-400">
                                        {" "}– ₱{highestPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {maxSavings > 0 && lowestStore && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Save up to ₱{maxSavings.toFixed(2)} at {lowestStore.split(" - ")[0]}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompareHeader;
