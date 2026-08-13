import React, { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    ShoppingCart,
    Trash2,
    Package,
    AlertTriangle,
    Wallet,
    Minus,
    Plus
} from "lucide-react";
import useSettings from "@/hooks/useSettings";

const Cart = React.memo(forwardRef(({ storage, onRemove, onRemoveLocation, onRemoveAll, onUpdateQuantity, addToast, reciept }, ref) => {
    const { settings } = useSettings();

    // --- BUDGET STATE ---
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [budget, setBudget] = useState(() => {
        const saved = localStorage.getItem('budgetbuddy_budget');
        return saved ? parseFloat(saved) : 0;
    });
    const [tempBudget, setTempBudget] = useState("");

    // --- ITEM QUANTITY STATE ---
    const [locationToClear, setLocationToClear] = useState(null);
    const [itemToUpdate, setItemToUpdate] = useState(null);
    const [tempQuantity, setTempQuantity] = useState(1);

    const cartItemQuantity = Object.keys(storage.cart).length;
    const groupedEntries = Object.entries(storage.cart).reduce((acc, [id, item]) => {
        // console.log(id)
        if (!acc[item.location]) acc[item.location] = []
        acc[item.location].push({ ...item, id })
        return acc;
    }, {});

    const cartItemEntries = Object.entries(groupedEntries);
    const total = Object.values(storage.cart).reduce((acc, item) => acc + item.price * item.quantity, 0);

    const remaining = budget - total;
    const isOverBudget = remaining < 0;

    // --- BUDGET LOGIC ---
    const openBudgetModal = () => {
        setTempBudget(budget > 0 ? budget.toString() : "");
        setIsBudgetModalOpen(true);
    };

    const handleSaveBudget = (e) => {
        e.preventDefault();
        const val = parseFloat(tempBudget);
        if (!isNaN(val) && val >= 0) {
            setBudget(val);
            localStorage.setItem('budgetbuddy_budget', val.toString());
        } else {
            setBudget(0);
            localStorage.setItem('budgetbuddy_budget', "0");
        }
        setIsBudgetModalOpen(false);
    };

    // --- ITEM QUANTITY LOGIC ---
    const openQuantityModal = (item) => {
        setItemToUpdate(item);
        setTempQuantity(item.quantity);
    };

    const handleSaveQuantity = (e) => {
        e.preventDefault();
        const newQuantity = parseInt(tempQuantity, 10);

        if (!isNaN(newQuantity) && newQuantity >= 0) {
            onUpdateQuantity(itemToUpdate.id, newQuantity);
        }
        setItemToUpdate(null);
    };

    const confirmClearLocation = () => {
        if (locationToClear && locationToClear !== 'The Cart' && onRemoveLocation) {
            onRemoveLocation(locationToClear);
        } else {
            onRemoveAll();
            setBudget(0)
        }
        setLocationToClear(null);
    };

    useEffect(() => {
        if (isOverBudget && budget !== 0) {
            addToast("Budget Warning", "You have gone beyond your limit. Becareful with your spending.", "destructive")
        }
    }, [isOverBudget, remaining, addToast])

    return (
        <>
            <div ref={ref} className="cart-summary h-[calc(100vh-60px)] min-[700px]:h-[60vh] dark:bg-gray-500 max-[700px]:z-40 z-20" style={{ left: reciept ? "100%" : "0%" }}>
                <div className="flex h-full flex-col">
                    {/* Cart Header */}
                    <button
                        className="flex flex-col items-start justify-between rounded-2xl border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] hover:from-gray-300 hover:to-gray-50 group hover:cursor-pointer"
                        onClick={openBudgetModal}
                    >
                        <div className="w-full flex flex-row justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="text-white group-hover:text-black" />
                                <h2 className="text-lg font-bold text-white group-hover:text-black">Shopping Cart</h2>
                            </div>
                            {cartItemQuantity !== 0 && (
                                <button className="rounded-full text-white group-hover:text-red-500" onClick={(e) => { e.stopPropagation(); setLocationToClear('The Cart'); }}>
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        {/* Cart Footer / Total & Budget Display */}
                        <div className="flex md:flex-col justify-between items-end md:items-start w-full mt-4">
                            <div className="flex flex-col md:items-start">
                                <span className="text-xs text-orange-200 group-hover:text-gray-500 font-medium mb-1">Estimated Total</span>
                                <span className="text-3xl font-bold text-white group-hover:text-black transition-colors leading-none">
                                    ₱{total.toFixed(2)}
                                </span>
                            </div>

                            {/* Solid background pill ensures perfect contrast on orange AND gray backgrounds */}
                            <div className="flex flex-col items-center md:items-end self-end">
                                <span className="text-xs text-orange-200 group-hover:text-gray-500 font-medium max-md:mb-1 md:mt-2">
                                    {budget > 0 ? `Budget: ₱${budget.toFixed(2)}` : 'Set Budget'}
                                </span>
                                {budget > 0 ? (
                                    <span className={`text-sm font-bold md:font-normal max-md:px-2.5 md:px-1 max-md:py-1 rounded-md max-md:shadow-sm transition-colors group-hover:text-black md:border-none ${isOverBudget
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        }`}>
                                        {isOverBudget ? 'Over by ' : 'Left: '}
                                        ₱{Math.abs(remaining).toFixed(2)}
                                    </span>
                                ) : (
                                    <span className="text-sm font-bold px-2.5 py-1 rounded-md bg-white/20 text-white group-hover:bg-gray-200 group-hover:text-gray-700 transition-colors">
                                        Tap to set
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto max-md:px-4">
                        {cartItemQuantity === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-400">
                                <ShoppingCart size={48} className="mb-4 opacity-20" />
                                <p>Your cart is empty.</p>
                                <p className="text-sm">Start adding some items!</p>
                            </div>
                        ) : (
                            cartItemEntries.map(([category, items]) => (
                                <div key={category} className="last:mb-0">
                                    {/* Group Header with Clear Button */}
                                    <div className="flex items-center justify-center border-b border-gray-100 py-4">
                                        <button
                                            onClick={() => setLocationToClear(category)}
                                        >
                                            <p className="p-2 cart-category text-sm hover:bg-red-500 text-gray-800 hover:text-white dark:text-orange-500 font-bold rounded-lg">
                                                {category}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Item List */}
                                    <ul key={category} className="max-md:space-y-4 space-y-2">
                                        {items.map((item) => (
                                            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-50 bg-white p-2 shadow-sm">
                                                {!settings.hidePhotos && (item.image ? (
                                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 relative">
                                                        <div className="product-image-placeholder" style={{ backgroundColor: "#ffccaa" }}>
                                                            <Package className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex-1 min-w-0">
                                                    {/* UPDATED: Clickable Name */}
                                                    <h4
                                                        className="truncate text-sm font-semibold text-gray-800 cursor-pointer hover:text-orange-500 transition-colors"
                                                        onClick={() => openQuantityModal(item)}
                                                        title="Click to adjust quantity"
                                                    >
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        ₱{item.price.toFixed(2)}
                                                        <button
                                                            onClick={() => openQuantityModal(item)}
                                                            className="text-orange-500 font-bold ml-1 hover:bg-orange-100 px-1.5 py-0.5 rounded transition-colors"
                                                        >
                                                            x{item.quantity}
                                                        </button>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul >
                                </div>))
                        )}
                    </div>
                </div>
            </div >

            {locationToClear && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Clear Location?</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed text-center">
                            Are you sure you want to remove all items from <span className="font-bold text-gray-900">{locationToClear}</span>? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setLocationToClear(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearLocation}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                            >
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Adjustment Modal */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
                    <form onSubmit={handleSaveBudget} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-2 text-orange-600">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <Wallet size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Set Your Budget</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-5">
                            Enter how much you plan to spend. We&apos;ll track your remaining balance as you shop.
                        </p>

                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                autoFocus
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium text-gray-900"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsBudgetModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors"
                            >
                                Save Budget
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {itemToUpdate && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
                    <form onSubmit={handleSaveQuantity} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4 text-orange-600">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <Package size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Adjust Quantity</h3>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-900 font-bold truncate text-lg mb-1">{itemToUpdate.name}</p>
                            <p className="text-gray-500 text-sm">₱{itemToUpdate.price.toFixed(2)} each</p>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-2 mb-6">
                            <button
                                type="button"
                                onClick={() => setTempQuantity(Math.max(0, tempQuantity - 1))}
                                className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                            >
                                <Minus size={20} />
                            </button>

                            <input
                                type="number"
                                min="0"
                                value={tempQuantity}
                                onChange={(e) => setTempQuantity(parseInt(e.target.value) || 0)}
                                className="w-20 text-center bg-transparent text-3xl font-bold text-gray-900 focus:outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setTempQuantity(tempQuantity + 1)}
                                className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-500 hover:border-green-200 transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setItemToUpdate(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors"
                            >
                                Save Quantity
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}));

// 👇 Give the component a name for debugging purposes
Cart.displayName = "Cart";

// 👇 Define PropTypes
Cart.propTypes = {
    storage: PropTypes.shape({
        cart: PropTypes.objectOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                quantity: PropTypes.number.isRequired,
                price: PropTypes.number.isRequired,
            })
        ).isRequired
    }).isRequired,
    onRemove: PropTypes.func.isRequired,
    onUpdateQuantity: PropTypes.func.isRequired,
    onRemoveLocation: PropTypes.func.isRequired,
    onRemoveAll: PropTypes.func.isRequired,
    addToast: PropTypes.func.isRequired,
    reciept: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Cart;
