"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import CompareSearchClient from "./CompareSearchClient";
import CompareClient from "./CompareClient";

export default function ComparePageClient() {
    const searchParams = useSearchParams();
    const product = searchParams.get("product") || searchParams.get("productId") || "";

    if (!product.trim()) {
        return <CompareSearchClient />;
    }

    return <CompareClient productId={product.trim()} />;
}
