"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Tag, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import Searchbar from "@/components/parts/Searchbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSearchProducts, { CatalogProduct } from "@/hooks/useSearchProducts";

const POPULAR_SEARCHES = [
    "Milk",
    "Rice",
    "Corned Beef",
    "Sardines",
    "Coffee",
    "Noodles",
    "Eggs",
    "Cooking Oil",
];

export default function CompareSearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
    const storeParam = searchParams.get("store") || null;

    const [inputVal, setInputVal] = useState(initialSearch);
    const [activeQuery, setActiveQuery] = useState(initialSearch);

    const { data: products = [], isLoading, isError, error } = useSearchProducts(activeQuery);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = inputVal.trim();
        if (trimmed) {
            setActiveQuery(trimmed);
            // Optionally update URL query param without full page reload
            const newUrl = storeParam
                ? `/compare?search=${encodeURIComponent(trimmed)}&store=${encodeURIComponent(storeParam)}`
                : `/compare?search=${encodeURIComponent(trimmed)}`;
            router.replace(newUrl);
        }
    };

    const handleQuickSearch = (keyword: string) => {
        setInputVal(keyword);
        setActiveQuery(keyword);
        const newUrl = storeParam
            ? `/compare?search=${encodeURIComponent(keyword)}&store=${encodeURIComponent(storeParam)}`
            : `/compare?search=${encodeURIComponent(keyword)}`;
        router.replace(newUrl);
    };

    const handleSelectProduct = (product: CatalogProduct) => {
        const productIdentifier = product.product_id || product.product_name;
        const targetUrl = storeParam
            ? `/compare?product=${encodeURIComponent(productIdentifier)}&store=${encodeURIComponent(storeParam)}`
            : `/compare?product=${encodeURIComponent(productIdentifier)}`;
        router.push(targetUrl);
    };

    return (
        <div className="min-h-[calc(100dvh-65px)] bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 transition-colors">
            <div className="max-w-4xl mx-auto">
                {/* Search Hero Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-xs mb-8 transition-colors">
                    {storeParam && (
                        <div className="mb-4">
                            <Link
                                href={`/locations/${storeParam}`}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to store products</span>
                            </Link>
                        </div>
                    )}

                    <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                            <Package className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2">
                            Compare Grocery Prices
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Search for any product to compare real-time prices across local stores in Iligan City.
                        </p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
                        <Searchbar
                            type="text"
                            placeholder="Search products (e.g., Selecta Milk, Bear Brand, Rice)..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                        >
                            <button
                                type="submit"
                                className="bg-[#ee4d2d] hover:bg-[#d63916] text-white rounded-lg px-4 py-2.5 transition-all flex items-center gap-1.5 font-semibold text-sm cursor-pointer shadow-xs"
                                aria-label="Search products"
                            >
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </Searchbar>
                    </form>

                    {/* Quick Search Chips */}
                    <div className="max-w-xl mx-auto mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                        <span className="text-gray-400 dark:text-gray-500 font-medium mr-1">Popular:</span>
                        {POPULAR_SEARCHES.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleQuickSearch(tag)}
                                className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                    activeQuery.toLowerCase() === tag.toLowerCase()
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : "bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Disambiguation Product Results */}
                {activeQuery.trim().length > 0 && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Product Matches for &ldquo;{activeQuery}&rdquo;
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Select the specific item you want to compare across stores.
                                </p>
                            </div>
                            {!isLoading && products.length > 0 && (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 self-start sm:self-auto">
                                    {products.length} {products.length === 1 ? "product found" : "products found"}
                                </span>
                            )}
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="py-16 flex flex-col items-center justify-center gap-3">
                                <div className="w-9 h-9 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Searching products in catalog...
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {isError && (
                            <div className="py-12 bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-950/50 p-6 text-center">
                                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    Error searching products
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    {error instanceof Error ? error.message : "Could not fetch catalog products"}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSearchSubmit()}
                                >
                                    Retry Search
                                </Button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !isError && products.length === 0 && (
                            <div className="py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
                                <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    No products found
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                                    We couldn&apos;t find any grocery products matching &ldquo;{activeQuery}&rdquo;. Try another brand or generic keyword like &ldquo;milk&rdquo; or &ldquo;rice&rdquo;.
                                </p>
                                <div className="flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setInputVal("");
                                            setActiveQuery("");
                                        }}
                                    >
                                        Clear Search
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Product Grid */}
                        {!isLoading && !isError && products.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                                {products.map((item) => (
                                    <div
                                        key={item._id || item.product_id}
                                        onClick={() => handleSelectProduct(item)}
                                        className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700/80 p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Product Image */}
                                            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-3 border border-gray-100 dark:border-gray-800">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.product_name}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50/50 dark:bg-orange-950/20 text-orange-400">
                                                        <Package className="w-10 h-10 stroke-[1.5]" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Category Tag */}
                                            {item.category?.catalog && (
                                                <div className="mb-1.5">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[11px] font-normal py-0 px-2 gap-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                                    >
                                                        <Tag className="w-3 h-3" />
                                                        {item.category.catalog}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Product Name */}
                                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                {item.product_name}
                                            </h3>
                                        </div>

                                        {/* Action CTA */}
                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
                                            <span>Compare Prices</span>
                                            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/50 group-hover:bg-orange-500 group-hover:text-white transition-colors flex items-center justify-center">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
