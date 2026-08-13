"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { hydrateCart } from "@/redux/cartSlice";

interface StoreProviderProps {
    children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
    useEffect(() => {
        // Sync localStorage to Redux ONLY on the client after mount
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                store.dispatch(hydrateCart(parsed));
            } catch (e) {
                console.error("Failed to hydrate cart", e);
            }
        }
    }, []);

    return <Provider store={store}>{children as any}</Provider>;
}
