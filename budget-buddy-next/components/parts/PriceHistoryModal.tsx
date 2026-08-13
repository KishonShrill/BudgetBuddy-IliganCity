"use client";

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import useFetchPriceHistory from '@/hooks/useFetchPriceHistory';

// 1. Define the TypeScript interfaces for your props and data structure
export interface ListingData {
    _id: string;
    updated_price: number;
    date_updated: string;
    product: {
        product_name: string;
    };
    location: {
        name: string;
    };
}

interface PriceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: ListingData | null;
}

// 2. Build a Custom Tooltip using Tailwind for perfect Dark Mode support
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-md transition-colors duration-300">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1 font-medium">{label}</p>
                <p className="text-orange-500 dark:text-orange-400 font-bold text-sm">
                    ₱{Number(payload[0].value).toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

export default function PriceHistoryModal({ isOpen, onClose, listing }: PriceHistoryModalProps) {

    const {
        data: history = [],
        isLoading,
        isError,
        error
    } = useFetchPriceHistory(isOpen && listing ? listing._id : null);

    // Format the data for Recharts: Combine old logs + current price
    const chartData = useMemo(() => {
        if (!listing) return [];

        // Map the historical data
        const formattedHistory = history.map((log: any) => ({
            price: log.old_price,
            date: new Date(log.date_recorded).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));

        // Append the current listing data at the end of the line
        formattedHistory.push({
            price: listing.updated_price,
            date: new Date(listing.date_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });

        return formattedHistory;
    }, [history, listing]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors duration-300">
                <DialogHeader>
                    <DialogTitle className="text-xl">Price History</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        {listing?.product?.product_name} at {listing?.location?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 min-h-[250px] flex flex-col justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin mb-2 text-orange-500" />
                            <p className="text-sm">Loading trends...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center text-red-500 dark:text-red-400 text-sm">
                            {(error as Error)?.message || "Failed to load history."}
                        </div>
                    ) : chartData.length < 2 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                            <p>Not enough data yet.</p>
                            <p className="text-xs mt-1 opacity-70">This price hasn't fluctuated since it was listed.</p>
                        </div>
                    ) : (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#9CA3AF" strokeOpacity={0.2} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        domain={['dataMin - 10', 'dataMax + 10']}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₱${value}`}
                                    />

                                    {/* Using our new custom Tailwind Tooltip */}
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '5 5' }} />

                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#f97316', stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
