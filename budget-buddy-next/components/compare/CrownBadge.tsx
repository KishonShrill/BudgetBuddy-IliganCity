import React from "react";
import { Crown } from "lucide-react";

interface CrownBadgeProps {
    className?: string;
    label?: string;
}

export const CrownBadge: React.FC<CrownBadgeProps> = ({
    className = "",
    label = "Lowest Price",
}) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/60 shadow-xs ${className}`}
        >
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:fill-amber-400 dark:text-amber-300" />
            <span>{label}</span>
        </span>
    );
};

export default CrownBadge;
