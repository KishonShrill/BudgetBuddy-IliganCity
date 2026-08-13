"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "@/components/parts/ToastContainer"; // Adjust import path as needed

// 1. Define your Types for TypeScript
interface Toast {
    id: number;
    name: string;
    description?: string | null;
    type: string;
    open: boolean;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (name: string, description?: string | null, type?: string) => void;
    removeToast: (id: number) => void;
}

// 2. Create the Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 3. Create the Provider Wrapper
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, open: false } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 400);
    }, []);

    const addToast = useCallback((name: string, description: string | null = null, type: string = "info") => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, name, description, type, open: true }]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            {/* The ToastContainer renders safely here on the client */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// 4. Create a custom hook so your pages can easily trigger toasts!
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};
