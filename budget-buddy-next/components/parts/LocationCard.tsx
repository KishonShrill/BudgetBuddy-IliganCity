"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Store, MapPin } from "lucide-react";

// Mapping of store names to their logo paths
const storeImages: Record<string, string> = {
    'gaisano': '/images/logos/gaisano-logo.jpg',
    '7-eleven': '/images/logos/7-eleven_logo.svg',
    'shoppe 24': '/images/logos/shoppe24-logo.webp',
};

export interface LocationCardProps {
    item: {
        _id: string;
        location_name: string;
        type: string;
        coordinates?: {
            lat?: number;
            lng?: number;
            zoom?: number;
            link?: string;
        };
        is_open_24hrs?: string;
    };
}

const LocationCard = ({ item }: LocationCardProps) => {
    const router = useRouter();

    // Memoize calculations to keep the component snappy
    const { shortName, match } = useMemo(() => {
        const name = item.location_name.split(' - ')[1] || item.location_name;
        const lowerName = item.location_name.toLowerCase();
        const foundMatch = Object.keys(storeImages).find(key => lowerName.includes(key));
        return { shortName: name, match: foundMatch };
    }, [item.location_name]);

    const buildMapUrl = () => {
        const link = item.coordinates?.link;
        if (link) return link;

        const { lat, lng, zoom = 15 } = item.coordinates || {};
        if (lat && lng) {
            return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }
        return `https://www.google.com/maps/search/${encodeURIComponent(item.location_name)}`;
    };

    const handleCardClick = () => {
        router.push(`/locations/${item._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-gray-600"
        >
            {/* Floating Google Maps Button */}
            <a
                href={buildMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-orange-500 hover:text-white dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-orange-500"
                title="View on Google Maps"
            >
                <MapPin size={18} />
            </a>

            {/* Logo Area with Placeholder Fallback */}
            <div className="relative flex aspect-video w-full items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-6 overflow-hidden">
                {match ? (
                    <Image
                        src={storeImages[match]}
                        alt={`${match} logo`}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                        unoptimized
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 transition-transform duration-300 group-hover:scale-110">
                        <Store size={48} strokeWidth={1.5} />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {/* Text Area */}
            <div className="flex flex-1 flex-col items-center justify-center p-5 text-center transition-colors">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{shortName}</h3>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                    <Store size={14} />
                    {item.type}
                </span>
            </div>
        </div>
    );
};

export default React.memo(LocationCard);
