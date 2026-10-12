import { Suspense } from "react";
import CompareClient from "./CompareClient";

// Required for Next.js static export (output: 'export') with dynamic routes
export async function generateStaticParams() {
    return [];
}

export default async function ComparePage({
    params,
}: {
    params: Promise<{ productId: string }>;
}) {
    const { productId } = await params;

    return (
        <Suspense
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-gray-500">Loading comparison...</span>
                    </div>
                </div>
            }
        >
            <CompareClient productId={productId} />
        </Suspense>
    );
}
