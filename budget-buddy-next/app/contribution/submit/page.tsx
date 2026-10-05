"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, Info, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { ResultAsync } from 'neverthrow';
import axios from 'axios';
import Cookies from 'js-cookie';

import ReCAPTCHA from 'react-google-recaptcha';
import CustomDatalist from '@/components/parts/CustomDatalist';
import { useToast } from '@/components/ToastProvider';

import useFetchLocations from '@/hooks/useFetchLocations';
import useFetchCategories from '@/hooks/useFetchCategories';
import useFetchProducts from '@/hooks/useFetchProducts';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
const URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions`;

interface CategoryItem {
    _id: string;
    category_list: string;
    category_catalog: string;
    category_name: string;
    name?: string;
}

interface LocationItem {
    _id?: string;
    id?: string;
    location_name: string;
}

interface ProductItem {
    _id?: string;
    product_id?: string;
    product_name: string;
    category?: {
        catalog?: string;
        list?: string;
        name?: string;
    };
}

export default function SubmitContribution() {
    const token = Cookies.get("budgetbuddy_token");
    const router = useRouter();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    // Fetch data using existing hooks
    const { data: fetchedProducts = [], isLoading: productsLoading } = useFetchProducts(token);
    const { data: fetchedLocations = [], isLoading: locationsLoading } = useFetchLocations();
    const { data: fetchedCategories = [], isLoading: categoriesLoading } = useFetchCategories();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        locationId: '',
        categoryId: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [capVal, setCapVal] = useState<string | null>(null);

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(fetchedProducts) || !fetchedProducts.length) return [];
        return (fetchedProducts as ProductItem[]).filter(p => !p.category?.list || p.category?.list === 'Groceries');
    }, [fetchedProducts]);

    const categoryMap = useMemo(() => {
        const map = new Map<string, string>();

        if (Array.isArray(fetchedCategories)) {
            (fetchedCategories as CategoryItem[]).forEach(c => {
                const key = `${c.category_catalog}|${c.category_list}|${c.category_name}`;
                map.set(key, c._id);
            });
        }

        return map;
    }, [fetchedCategories]);

    // Group categories for Groceries
    const groupedCategories = useMemo(() => {
        if (!Array.isArray(fetchedCategories) || !fetchedCategories.length) {
            return [];
        }

        const categoriesList = (fetchedCategories as CategoryItem[]).filter(
            c => !c.category_list || c.category_list === 'Groceries'
        );

        const grouped = categoriesList.reduce((acc: Record<string, CategoryItem[]>, cat) => {
            const catalog = cat.category_catalog || 'General';
            if (!acc[catalog]) acc[catalog] = [];
            acc[catalog].push(cat);
            return acc;
        }, {});

        return Object.keys(grouped).sort().map(catalog => ({
            catalogName: catalog,
            items: grouped[catalog].sort((a, b) =>
                (a.category_name || '').localeCompare(b.category_name || '')
            )
        }));
    }, [fetchedCategories]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedName = e.target.value;

        // 1. Update the name field normally
        setFormData(prev => ({ ...prev, name: selectedName }));

        // 2. Check if this exact name exists in products database
        const existingProduct = (fetchedProducts as ProductItem[]).find(
            p => p.product_name?.toLowerCase() === selectedName.toLowerCase()
        );

        // 3. If it exists, auto-fill the category to save time
        if (existingProduct && existingProduct.category) {
            const prodCat = existingProduct.category;
            const key = `${prodCat.catalog}|${prodCat.list}|${prodCat.name}`;
            const matchedCategoryId = categoryMap.get(key);

            setFormData(prev => ({
                ...prev,
                name: selectedName,
                categoryId: matchedCategoryId || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                categoryId: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.categoryId) {
            addToast("Error", "Please pick a valid product name from the list or pick a category...", "destructive");
            setIsSubmitting(false);
            return;
        }
        if (!formData.locationId) {
            addToast("Error", "Please pick a location...", "destructive");
            setIsSubmitting(false);
            return;
        }

        const selectedCategory = (fetchedCategories as CategoryItem[]).find(c => c._id === formData.categoryId);
        const selectedLocation = (fetchedLocations as LocationItem[]).find(c => (c._id || c.id) === formData.locationId);

        if (!selectedCategory || !selectedLocation) {
            addToast("Error", "Selected category or location not found", "destructive");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            productName: formData.name,
            price: Number(formData.price),
            category: {
                _id: selectedCategory._id,
                catalog: selectedCategory.category_catalog,
                list: selectedCategory.category_list || 'Groceries',
                name: selectedCategory.category_name,
            },
            location: {
                _id: selectedLocation._id || selectedLocation.id,
                name: selectedLocation.location_name,
            },
            listType: 'Groceries'
        };

        await ResultAsync.fromPromise(
            axios.post(URL, payload, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            (error: any) => error.response?.data?.message || "Failed to submit contribution."
        )
            .map((response) => response.data)
            .match(
                () => {
                    addToast("Success", "Contribution submitted for community review!", "success");
                    queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] });
                    router.push('/contribution');
                },
                (errMessage) => {
                    addToast("Error", errMessage, "destructive");
                }
            );

        setIsSubmitting(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!token) {
        return (
            <div className="min-h-[calc(100dvh-65px)] lg:h-[calc(100dvh-65px)] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="flex flex-col items-center justify-center max-w-md w-full py-12 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-center shadow-sm">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sign in Required</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        You need to be logged in to submit new price contributions to the community.
                    </p>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                        onClick={() => router.push('/authenticate')}
                    >
                        Sign In / Register
                    </Button>
                </div>
            </div>
        );
    }

    if (productsLoading || locationsLoading || categoriesLoading) {
        return (
            <div className="min-h-[calc(100dvh-65px)] lg:h-[calc(100dvh-65px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100dvh-65px)] lg:h-[calc(100dvh-65px)] overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="flex flex-col items-end max-w-2xl mx-auto p-4 md:p-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/contribution')}
                    className="mb-3 -ml-4 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md cursor-pointer self-start"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
                </Button>

                <Card className="w-full border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-gray-800 transition-colors py-0 gap-0">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-[#ff6b47] text-white p-6">
                        <CardTitle className="text-xl font-bold text-white">Submit a New Price</CardTitle>
                        <p className="text-orange-50 text-sm mt-1 opacity-90">
                            Your submission will be reviewed by the community. You earn +5 points if approved!
                        </p>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Product Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-semibold">
                                    Product Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    required
                                    list="existingProducts"
                                    autoComplete="off"
                                    placeholder="e.g. Joy Dishwashing Liquid 250ml"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="focus-visible:ring-orange-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                                <CustomDatalist id="existingProducts" items={filteredProducts} inputValue={formData.name} />
                            </div>

                            {/* Price & Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-gray-700 dark:text-gray-300 font-semibold">
                                        Price (₱) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="price"
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        className="focus-visible:ring-orange-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-semibold">
                                        Category <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(val) => handleInputChange('categoryId', val)}
                                        disabled={true}
                                    >
                                        <SelectTrigger className="w-full focus:ring-orange-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                            <SelectValue placeholder="Auto-filled from product" />
                                        </SelectTrigger>

                                        {/* Grouped Category Content */}
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
                                            {groupedCategories.length > 0 ? (
                                                groupedCategories.map((group, index) => (
                                                    <SelectGroup key={`${group.catalogName}${index}`}>
                                                        <SelectLabel className="font-bold text-white bg-gray-600 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 py-2 cursor-default sticky top-0 z-10 px-3">
                                                            {group.catalogName}
                                                        </SelectLabel>

                                                        {group.items.map((cat, catIdx) => (
                                                            <SelectItem
                                                                key={`${cat._id}${catIdx}`}
                                                                value={cat._id}
                                                                className="pl-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                            >
                                                                {cat.category_name || cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                    No categories available.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Location Dropdown & Support Link */}
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-gray-700 dark:text-gray-300 font-semibold">
                                    Store Location <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.locationId}
                                    onValueChange={(val) => handleInputChange('locationId', val)}
                                >
                                    <SelectTrigger className="w-full focus:ring-orange-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Select a store location" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
                                        {Array.isArray(fetchedLocations) && (fetchedLocations as LocationItem[]).map((loc) => (
                                            <SelectItem
                                                key={loc._id || loc.id}
                                                value={loc._id || loc.id || ''}
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                {loc.location_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(!DEVELOPMENT && process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY) && (
                                    <div className='flex justify-center my-4'>
                                        <ReCAPTCHA
                                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY as string}
                                            onChange={(val: any) => setCapVal(val)}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Info className="w-4 h-4 mr-1.5 text-gray-400" />
                                    Don&apos;t see the store/product?
                                    <Link
                                        href="/report"
                                        className="ml-1 text-orange-500 hover:text-orange-600 font-medium hover:underline"
                                    >
                                        Request to add it here.
                                    </Link>
                                </div>
                            </div>

                            {/* Submit Action */}
                            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || (!DEVELOPMENT && process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ? !capVal : false)}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg transition-all font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Save className="w-5 h-5 mr-2" /> Submit for Review</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
