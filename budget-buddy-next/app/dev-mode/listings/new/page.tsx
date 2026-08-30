"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query'; // v5
import axios from 'axios';
import Cookies from 'js-cookie';

import useFetchLocations from '@/hooks/useFetchLocations';
import { useToast } from '@/components/ToastProvider';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const saveListingUrl = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

// --- TypeScript Interfaces ---
interface Product {
    _id: string;
    product_id: string;
    product_name: string;
    imageUrl?: string;
    category?: {
        list: string;
        name: string;
        catalog: string;
    };
}

interface Location {
    _id?: string;
    id?: string;
    location_name: string;
}

export default function ListingForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    // Hydration & Transfer State
    const [isMounted, setIsMounted] = useState(false);
    const [baseProducts, setBaseProducts] = useState<Product[]>([]);
    const [isBulk, setIsBulk] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [listingId, setListingId] = useState('');

    const [loading, setLoading] = useState(false);

    // New States
    const [locationId, setLocationId] = useState('');
    const [prices, setPrices] = useState<Record<string, string | number>>({});
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const { data: fetchedLocations = [], isLoading: locationsLoading } = useFetchLocations();

    useEffect(() => {
        setIsMounted(true);

        // Retrieve transfer payload from sessionStorage
        const payloadStr = sessionStorage.getItem('listing_transfer_data');

        if (!payloadStr) {
            addToast("Forbidden!", `Please access this page through console listings page.`, "destructive");
            router.push("/dev-mode/listings");
            return;
        }

        try {
            const payload = JSON.parse(payloadStr);

            if (!payload.populated || !payload.baseProducts || payload.baseProducts.length === 0) {
                throw new Error("Invalid payload data");
            }

            setBaseProducts(payload.baseProducts);
            setIsBulk(!!payload.isBulk);
            setIsEdit(!!payload.isEdit);
            setListingId(payload.listingId || '');

            if (payload.isBulk) {
                setIsLocationModalOpen(true);
            }

            if (payload.isEdit) {
                setLocationId(payload.existingLocationId || '');
                // Pre-fill the price if it's an edit
                if (payload.baseProducts[0] && payload.existingPrice) {
                    setPrices({ [payload.baseProducts[0]._id]: payload.existingPrice });
                }
            }

            // Optional: Clean up storage so refreshing kicks them out
            // sessionStorage.removeItem('listing_transfer_data');

        } catch (error) {
            addToast("Error", "Failed to load listing data.", "destructive");
            router.push("/dev-mode/listings");
        }
    }, [router, addToast]);

    const handlePriceChange = (productId: string, value: string) => {
        setPrices(prev => ({ ...prev, [productId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!locationId) {
            addToast("Missing Information", "Please select a location before posting.", "destructive");
            return;
        }

        const selectedLocation = fetchedLocations.find((l: Location) => l._id === locationId || l.id === locationId);
        setLoading(true);

        // 1. Create a single array of all the listing payloads
        const bulkPayload = baseProducts.map(product => ({
            updated_price: parseFloat(prices[product._id] as string || "0"),
            date_updated: new Date().toISOString().split('T')[0],
            category: {
                list: product.category?.list || null,
                name: product.category?.name || null,
                catalog: product.category?.catalog || null
            },
            location: {
                id: selectedLocation?._id || selectedLocation?.id,
                name: selectedLocation?.location_name || null
            },
            product: {
                product_id: product.product_id,
                product_name: product.product_name,
                imageUrl: product.imageUrl || null
            },
            shelf: 'published'
        }));

        try {
            // 2. Send ONE request based on whether it's a single edit or a bulk creation
            if (isEdit) {
                await axios.put(`${saveListingUrl}/${listingId}`, bulkPayload[0], {
                    headers: { Authorization: `Bearer ${Cookies.get("budgetbuddy_token")}` }
                });
            } else {
                const targetUrl = isBulk ? `${saveListingUrl}/bulk` : saveListingUrl;
                const dataToSend = isBulk ? bulkPayload : bulkPayload[0];

                await axios.post(targetUrl, dataToSend, {
                    headers: { Authorization: `Bearer ${Cookies.get("budgetbuddy_token")}` }
                });
            }

            // v5 syntax
            queryClient.invalidateQueries({ queryKey: ['fetchedListings_Admin'] });

            addToast("Success", `Successfully ${isEdit ? 'updated' : 'created'} ${baseProducts.length} listing(s)!`, "success");

            // Clean up session storage before leaving
            sessionStorage.removeItem('listing_transfer_data');
            router.push('/dev-mode/listings');

        } catch (error: any) {
            addToast("Error", error.response?.data?.message || "Failed to save some listings.", "destructive");
            setLoading(false);
        }
    };

    if (!isMounted || baseProducts.length === 0) return null;

    if (locationsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="relative flex-1 overflow-hidden bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 py-4 md:py-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {isEdit ? 'Edit Listing' : isBulk ? 'Bulk Create Listings' : 'Create Listing'}
                    </h1>
                    <p className="mt-1 text-xs md:text-sm text-gray-500">
                        {isBulk ? `Drafting ${baseProducts.length} items` : `Listing based on: ${baseProducts[0]?.product_name}`}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dev-mode/listings')} className="bg-gray-100 hover:bg-gray-300">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>

            {/* Form Container */}
            <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                <div className="max-w-4xl mx-auto bg-white">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pricing Details</CardTitle>

                            {/* Location Display / Edit for the whole batch */}
                            <div className="flex items-center gap-4">
                                <Label>Location:</Label>
                                <Select value={locationId} onValueChange={setLocationId} disabled={isEdit}>
                                    <SelectTrigger className="w-[250px] hover:bg-orange-100">
                                        <SelectValue placeholder="Select a location..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {fetchedLocations.map((loc: Location) => (
                                            <SelectItem key={loc._id || loc.id} value={(loc._id || loc.id) as string} className="cursor-pointer hover:bg-gray-200">
                                                {loc.location_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Dynamic Product List */}
                                <div className="space-y-4">
                                    {baseProducts.map((product) => (
                                        <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white rounded border overflow-hidden shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    {product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{product.product_name}</h4>
                                                    <p className="text-xs text-gray-500">{product.category?.name || "Uncategorized"}</p>
                                                </div>
                                            </div>

                                            <div className="w-40">
                                                <Label className="sr-only">Price</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                                    <Input
                                                        className="pl-8 font-semibold text-lg"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={prices[product._id] || ''}
                                                        onChange={(e) => handlePriceChange(product._id, e.target.value)}
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end space-x-4 pt-6 border-t mt-8">
                                    <Button type="button" variant="outline" onClick={() => router.push('/dev-mode/listings')}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {isEdit ? 'Update Listing' : `Post ${baseProducts.length} Listing(s)`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Initial Bulk Location Modal */}
            <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Select Location for Bulk Update</DialogTitle>
                        <DialogDescription>
                            Where are you recording prices for these {baseProducts.length} items?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={locationId} onValueChange={(val) => {
                            setLocationId(val);
                            setIsLocationModalOpen(false);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a location..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {fetchedLocations.map((loc: Location) => (
                                    <SelectItem key={loc._id || loc.id} value={(loc._id || loc.id) as string} className="hover:bg-gray-200 cursor-pointer">
                                        {loc.location_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
