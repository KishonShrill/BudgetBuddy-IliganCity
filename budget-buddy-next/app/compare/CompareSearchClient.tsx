"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Searchbar from "@/components/parts/Searchbar";
import { Package, Search } from "lucide-react";

export default function CompareSearchClient() {
    const [search, setSearch] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/compare?product=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            <div className="max-w-xl w-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center mx-auto mb-6">
                    <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">
                    Price Comparison
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Search for a grocery product to compare prices across local stores.
                </p>

                <form onSubmit={handleSearch} className="w-full">
                    <Searchbar
                        type="text"
                        placeholder="Search products (e.g., milk, rice)..."
                        onChange={(e) => setSearch(e.target.value)}
                    >
                        <button
                            type="submit"
                            className="bg-orange-500 text-white rounded-lg p-3 hover:bg-orange-600 transition-colors"
                            aria-label="Search"
                        >
                            <Search size={22} />
                        </button>
                    </Searchbar>
                </form>
            </div>
        </div>
    );
}
