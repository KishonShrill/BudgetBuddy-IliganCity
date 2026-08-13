"use client";

import React, { forwardRef, useEffect, useState, useMemo } from "react";
import {
    ShoppingCart,
    Trash2,
    Package,
    AlertTriangle,
    Wallet,
    Minus,
    Plus,
    X
} from "lucide-react";
import useSettings from "@/hooks/useSettings";
import Image from "next/image";
import { cn } from "@/helpers/utils";

// Interfaces for Type Safety
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    location: string;
    image?: string;
}

interface CartProps {
    storage: {
        cart: Record<string, Omit<CartItem, 'id'>>;
    };
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveLocation: (location: string) => void;
    onRemoveAll: () => void;
    addToast: (title: string, description: string, variant?: "default" | "destructive" | "success") => void;
    receipt: boolean; // This is the 'left' position style
}

const Cart = forwardRef<HTMLDivElement, CartProps>(({
    storage,
    onRemove,
    onRemoveLocation,
    onRemoveAll,
    onUpdateQuantity,
    addToast,
    receipt
}, ref) => {
    const { settings } = useSettings();

    // --- BUDGET STATE ---
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [budget, setBudget] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('budgetbuddy_budget');
            return saved ? parseFloat(saved) : 0;
        }
        return 0;
    });
    const [tempBudget, setTempBudget] = useState("");

    // --- ITEM QUANTITY STATE ---
    const [locationToClear, setLocationToClear] = useState<string | null>(null);
    const [itemToUpdate, setItemToUpdate] = useState<CartItem | null>(null);
    const [tempQuantity, setTempQuantity] = useState(1);

    // --- COMPUTED VALUES ---
    const cartItemQuantity = Object.keys(storage.cart).length;

    const groupedEntries = useMemo(() => {
        return Object.entries(storage.cart).reduce((acc, [id, item]) => {
            if (!acc[item.location]) acc[item.location] = [];
            acc[item.location].push({ ...item, id });
            return acc;
        }, {} as Record<string, CartItem[]>);
    }, [storage.cart]);

    const cartItemEntries = Object.entries(groupedEntries);
    const total = Object.values(storage.cart).reduce((acc, item) => acc + item.price * item.quantity, 0);

    const remaining = budget - total;
    const isOverBudget = remaining < 0;

    // --- HANDLERS ---
    const openBudgetModal = () => {
        setTempBudget(budget > 0 ? budget.toString() : "");
        setIsBudgetModalOpen(true);
    };

    const handleSaveBudget = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(tempBudget);
        const finalVal = !isNaN(val) && val >= 0 ? val : 0;
        setBudget(finalVal);
        localStorage.setItem('budgetbuddy_budget', finalVal.toString());
        setIsBudgetModalOpen(false);
    };

    const openQuantityModal = (item: CartItem) => {
        setItemToUpdate(item);
        setTempQuantity(item.quantity);
    };

    const handleSaveQuantity = (e: React.FormEvent) => {
        e.preventDefault();
        if (itemToUpdate) {
            onUpdateQuantity(itemToUpdate.id, tempQuantity);
        }
        setItemToUpdate(null);
    };

    const confirmClearLocation = () => {
        if (locationToClear && locationToClear !== 'The Cart') {
            onRemoveLocation(locationToClear);
        } else {
            onRemoveAll();
            setBudget(0);
        }
        setLocationToClear(null);
    };

    useEffect(() => {
        if (isOverBudget && budget !== 0) {
            addToast("Budget Warning", "You have gone beyond your limit. Be careful with your spending.", "destructive");
        }
    }, [isOverBudget, budget, addToast]);

    return (
        <>
            <div
                ref={ref}
                className={cn(
                    // === Shared Base Styles ===
                    "flex flex-col overflow-hidden",
                    "bg-white dark:bg-gray-800",
                    "transition-all duration-300 ease-in-out",
                    "p-3.75",

                    // === Mobile Styles (Default Base Classes) ===
                    "fixed top-15 bottom-0 w-full",
                    "pb-28 rounded-none shadow-2xl z-40 border-l dark:border-gray-800",
                    // Mobile Slide Logic (replaces the inline style block)
                    receipt ? "left-0" : "left-full",

                    // === Desktop Styles (md: >= 768px) ===
                    // Overrides mobile fixed positioning and naturally resets 'left'
                    "md:sticky md:top-20 md:bottom-auto md:left-auto",
                    "md:w-[330px] md:min-w-[300px] md:h-[60vh]",
                    "md:pb-[15px] md:self-start",
                    "md:rounded-2xl md:shadow-md md:border md:border-gray-100"
                )}
            >
                <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900/50">
                    {/* Header: Displays Total and Budget trigger */}
                    <button
                        className="cursor-pointer flex flex-col items-start justify-between p-6 rounded-xl bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] hover:brightness-110 transition-all group"
                        onClick={openBudgetModal}
                    >
                        <div className="w-full flex flex-row justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="text-white" />
                                <h2 className="text-lg font-bold text-white inter-bold uppercase">Shopping Cart</h2>
                            </div>
                            {cartItemQuantity !== 0 && (
                                <div
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setLocationToClear('The Cart'); }}
                                >
                                    <Trash2 size={20} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-end w-full flex-wrap">
                            <div className="flex flex-col">
                                <span className="text-xs text-orange-100/80 font-medium mb-1 uppercase">Total Estimate:</span>
                                <span className="text-4xl font-black text-white leading-none tracking-tight">
                                    ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex flex-col items-end ml-auto">
                                <span className="text-xs text-orange-100/80 font-medium mb-1">
                                    {budget > 0 ? `Limit: ₱${budget.toFixed(2)}` : 'Set Limit'}
                                </span>
                                {budget > 0 ? (
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm ${isOverBudget ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                                        }`}>
                                        {isOverBudget ? 'Over by ' : 'Left: '}
                                        ₱{Math.abs(remaining).toFixed(2)}
                                    </span>
                                ) : (
                                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30">
                                        Tap to set
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>

                    {/* Scrollable Items Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {cartItemQuantity === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                <Package size={64} className="mb-4 opacity-20" />
                                <p className="font-bold">Your cart is empty.</p>
                                <p className="text-sm">Add products from local stores!</p>
                            </div>
                        ) : (
                            cartItemEntries.map(([location, items]) => (
                                <div key={location} className="space-y-3">
                                    <div className="flex items-center justify-between border-b dark:border-gray-800 pb-2">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{location}</h3>
                                        <button
                                            onClick={() => setLocationToClear(location)}
                                            className="cursor-pointer text-[10px] font-bold text-red-500 hover:underline"
                                        >
                                            Clear Store
                                        </button>
                                    </div>

                                    <ul className="space-y-2">
                                        {items.map((item) => (
                                            <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md transition-shadow group">
                                                {!settings.hidePhotos && (
                                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                                                        {item.image ? (
                                                            <Image src={item.image} alt={item.name || ""} fill sizes="48px" className="object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Package size={20} className="text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <h4
                                                        className="truncate text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-orange-500"
                                                        onClick={() => openQuantityModal(item)}
                                                    >
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-bold text-orange-600">₱{item.price.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => openQuantityModal(item)}
                                                            className="cursor-pointer text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-black hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600"
                                                        >
                                                            x{item.quantity}
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="cursor-pointer p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS: Use a fixed overlay that matches the dashboard aesthetic */}

            {/* 1. Clear Confirmation */}
            {locationToClear && (
                <ModalWrapper onClose={() => setLocationToClear(null)}>
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold dark:text-white">Clear Items?</h3>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Remove all items from <span className="font-bold text-gray-900 dark:text-gray-100">{locationToClear}</span>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setLocationToClear(null)} className="cursor-pointer px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
                        <button onClick={confirmClearLocation} className="cursor-pointer px-6 py-2 text-sm font-bold text-white bg-red-600 rounded-xl shadow-lg shadow-red-900/20">Clear All</button>
                    </div>
                </ModalWrapper>
            )}

            {/* 2. Budget Modal */}
            {isBudgetModalOpen && (
                <ModalWrapper onClose={() => setIsBudgetModalOpen(false)}>
                    <div className="flex items-center gap-3 mb-2 text-orange-600">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <Wallet size={24} />
                        </div>
                        <h3 className="text-lg font-bold dark:text-white">Set Budget</h3>
                    </div>
                    <form onSubmit={handleSaveBudget}>
                        <div className="relative my-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                autoFocus
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-xl dark:text-white"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="cursor-pointer px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
                            <button type="submit" className="cursor-pointer px-6 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl shadow-lg shadow-orange-900/20">Save Budget</button>
                        </div>
                    </form>
                </ModalWrapper>
            )}

            {/* 3. Quantity Modal */}
            {itemToUpdate && (
                <ModalWrapper onClose={() => setItemToUpdate(null)}>
                    <div className="flex items-center gap-3 mb-4 text-orange-600">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <Package size={24} />
                        </div>
                        <h3 className="text-lg font-bold dark:text-white">Quantity</h3>
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-bold mb-6 text-center text-xl">{itemToUpdate.name}</p>

                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-3 mb-8">
                        <button
                            type="button"
                            onClick={() => setTempQuantity(Math.max(0, tempQuantity - 1))}
                            className="cursor-pointer w-14 h-14 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 text-gray-600 dark:text-white active:scale-95 transition-transform"
                        >
                            <Minus size={24} />
                        </button>
                        <span className="text-4xl font-black dark:text-white">{tempQuantity}</span>
                        <button
                            type="button"
                            onClick={() => setTempQuantity(tempQuantity + 1)}
                            className="cursor-pointer w-14 h-14 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 text-gray-600 dark:text-white active:scale-95 transition-transform"
                        >
                            <Plus size={24} />
                        </button>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setItemToUpdate(null)} className="px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
                        <button onClick={handleSaveQuantity} className="cursor-pointer px-6 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl shadow-lg shadow-orange-900/20">Update</button>
                    </div>
                </ModalWrapper>
            )}
        </>
    );
});

// A reusable Modal Wrapper for internal Cart modals
const ModalWrapper = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 relative border dark:border-gray-700">
            <button onClick={onClose} className="cursor-pointer absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X size={20} />
            </button>
            {children}
        </div>
    </div>
);

Cart.displayName = "Cart";

export default React.memo(Cart);
