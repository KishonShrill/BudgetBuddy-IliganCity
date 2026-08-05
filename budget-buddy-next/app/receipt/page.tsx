"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link'; // Next.js native Link
import { toPng } from 'html-to-image';
import { Copy, FileDown, ImageDown } from 'lucide-react'; // Swapped to Lucide icons
// import '@/styles/receipt.scss'; // Uncomment if keeping custom SCSS

// TypeScript Interfaces
interface CartItem {
    name: string;
    price: number;
    quantity: number;
    location: string;
}

type Cart = Record<string, CartItem>;

export default function ReceiptClient() {
    const [cart, setCart] = useState<Cart>({});
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse cart data", e);
            }
        }
    }, []);

    const cartItemQuantity = Object.keys(cart).length;

    // Group items by location
    const groupedEntries = Object.entries(cart).reduce((acc, [id, item]) => {
        if (!acc[item.location]) acc[item.location] = [];
        acc[item.location].push({ ...item, id } as any);
        return acc;
    }, {} as Record<string, (CartItem & { id: string })[]>);

    const cartItemEntries = Object.entries(groupedEntries);

    const total = Object.values(cart).reduce(
        (acc, item) => acc + item.price * item.quantity, 0
    );

    const generateReceiptText = () => {
        let receiptText = "🧾 Budget Buddy - Receipt\n\n";
        if (Object.keys(cart).length === 0) {
            receiptText += "Your receipt is empty.\n";
        } else {
            cartItemEntries.forEach(([location, items]) => {
                receiptText += `📍 ${location}\n`;
                items.forEach((item) => {
                    receiptText += `  - ${item.name} x${item.quantity} ₱${(item.price * item.quantity).toFixed(2)}\n`;
                });
                receiptText += `\n`;
            });
            receiptText += `Total: ₱${total.toFixed(2)}\n`;
        }
        return receiptText;
    };

    const copyReceiptAsText = async () => {
        const receiptText = generateReceiptText();
        try {
            await navigator.clipboard.writeText(receiptText);
            alert('Receipt copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy receipt. Please try again.');
        }
    };

    const downloadReceiptAsCSV = () => {
        let csvContent = "Location,Product Name,Quantity,Price\n";

        cartItemEntries.forEach(([location, items]) => {
            items.forEach((item) => {
                const safeLocation = `"${location.replace(/"/g, '""')}"`;
                const safeName = `"${item.name.replace(/"/g, '""')}"`;
                const totalPrice = (item.price * item.quantity).toFixed(2);
                csvContent += `${safeLocation},${safeName},${item.quantity},${totalPrice}\n`;
            });
        });

        csvContent += `,,Total,${total.toFixed(2)}\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'budget-buddy-receipt.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadReceiptAsImage = async () => {
        if (!receiptRef.current) return;

        try {
            await document.fonts.ready;

            // Hide action buttons from the screenshot
            const filter = (node: HTMLElement) => {
                return !node.classList?.contains('receipt-actions');
            };

            const node = receiptRef.current;

            const dataUrl = await toPng(node, {
                cacheBust: true,
                pixelRatio: 2,
                filter: filter as any,
                width: node.offsetWidth,
                height: node.offsetHeight,
                style: {
                    margin: '0',
                    transform: 'none',
                    position: 'static'
                }
            });

            const link = document.createElement('a');
            link.download = 'budget-buddy-receipt.png';
            link.href = dataUrl;
            link.click();

        } catch (error) {
            console.error('Failed to generate image:', error);
            alert('Failed to download image. Please try again.');
        }
    };

    return (
        <div className="min-h-[calc(100dvh-62px)] bg-gray-50 dark:bg-gray-900 sm:py-8 transition-colors duration-300">
            <div
                className="receipt-container sm:max-w-lg mx-auto bg-white dark:bg-gray-800 sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
                ref={receiptRef}
            >
                <h2 className='text-center font-black text-2xl text-gray-900 dark:text-white mb-8'>
                    🧾 Budget Buddy - Receipt
                </h2>

                {cartItemQuantity === 0 ? (
                    <div className="empty-receipt text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Your receipt is empty.</p>
                        <Link
                            href="/locations"
                            className="start-shopping-btn inline-block bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white font-semibold px-6 py-3 rounded-full hover:scale-105 hover:shadow-lg transition-all"
                        >
                            Start Adding Items
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="receipt-items space-y-6">
                            {cartItemEntries.map(([category, items]) => (
                                <div key={category} className='receipt-category-group'>
                                    <p className='receipt-category font-bold text-[#ee4d2d] dark:text-orange-400 border-b border-gray-100 dark:border-gray-700 pb-2 mb-3'>
                                        📍 {category}
                                    </p>
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="receipt-item flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                                <span className="item-name flex-1">{item.name}</span>
                                                <span className="item-qty w-12 text-center text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                                                <span className="item-price w-24 text-right font-medium text-gray-900 dark:text-white">
                                                    ₱{(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="receipt-total mt-8 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center text-lg font-black text-gray-900 dark:text-white">
                            <span>Total:</span>
                            <span className="text-[#ee4d2d] dark:text-orange-400">₱{total.toFixed(2)}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Action Buttons (Filtered out during image download) */}
            <div className="container receipt-actions mx-auto mt-4 max-md:mb-22 px-4 grid grid-cols-3 gap-3">
                <button
                    onClick={copyReceiptAsText}
                    className="download-btn flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-semibold"
                >
                    <Copy className="w-5 h-5" />
                    Text
                </button>
                <button
                    onClick={downloadReceiptAsCSV}
                    className="download-btn flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-semibold"
                >
                    <FileDown className="w-5 h-5" />
                    CSV
                </button>
                <button
                    onClick={downloadReceiptAsImage}
                    className="download-btn flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-[#ee4d2d] text-white hover:bg-[#d63916] transition-colors text-xs font-semibold"
                >
                    <ImageDown className="w-5 h-5" />
                    Image
                </button>
            </div>
        </div>
    );
}
