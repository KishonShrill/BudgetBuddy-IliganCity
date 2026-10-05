"use client";

import { useMemo } from 'react';

interface CustomDatalistProps {
    id: string;
    items: Array<{
        _id?: string;
        product_id?: string;
        product_name?: string;
        category?: {
            name?: string;
            catalog?: string;
            list?: string;
        };
    }>;
    inputValue: string;
}

export default function CustomDatalist({ id, items, inputValue }: CustomDatalistProps) {
    const limitedItems = useMemo(() => {
        if (!items || items.length === 0) return [];

        // 1. Filter items based on what the user is typing
        const lowerInput = (inputValue || '').toLowerCase();
        const matchingItems = items.filter(item =>
            (item.product_name || '').toLowerCase().includes(lowerInput)
        );

        // 2. Sort the matches (Category first, then Name)
        const sortedItems = matchingItems.sort((a, b) => {
            const catA = a.category?.name || "General";
            const catB = b.category?.name || "General";

            if (catA < catB) return -1;
            if (catA > catB) return 1;

            const nameA = a.product_name || "";
            const nameB = b.product_name || "";

            return nameA.localeCompare(nameB);
        });

        // 3. Slice to keep only the top 5 results
        return sortedItems.slice(0, 5);
    }, [items, inputValue]);

    return (
        <datalist id={id}>
            {limitedItems.map((item) => (
                <option key={item._id || item.product_id} value={item.product_name}>
                    {item.category?.name || "General"}
                </option>
            ))}
        </datalist>
    );
}
