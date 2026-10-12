import { Suspense } from "react";
import ComparePageClient from "./ComparePageClient";

export default function ComparePage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-gray-500">Loading comparison...</span>
                    </div>
                </div>
            }
        >
            <ComparePageClient />
        </Suspense>
    );
}
