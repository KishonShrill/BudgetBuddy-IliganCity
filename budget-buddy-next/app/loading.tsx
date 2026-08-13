import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Loading(): React.JSX.Element {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center w-full bg-transparent">
            <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring for the glow effect */}
                <div className="absolute h-24 w-24 animate-ping rounded-full bg-orange-500/20 dark:bg-orange-500/10"></div>

                {/* Inner branded circle */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/30">
                    <ShoppingBag className="h-8 w-8 animate-bounce" />
                </div>
            </div>

            {/* Branded Text */}
            <h2 className="mt-8 text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Budget Buddy
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Finding the best prices<span className="animate-pulse text-orange-500 text-base">...</span>
            </p>
        </div>
    );
}
