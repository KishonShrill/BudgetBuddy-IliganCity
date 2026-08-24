"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Loader2, Store, Utensils } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import { useQueryClient } from '@tanstack/react-query'; // v5
import axios from 'axios';
import Cookies from 'js-cookie';

import useFetchCategories from '@/hooks/useFetchCategories';
import useFetchProduct from '@/hooks/useFetchProduct';
import { useToast } from '@/components/ToastProvider';

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const saveProductUrl = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products`;

// --- Interfaces ---
interface Category {
    _id: string;
    category_list: string;
    category_catalog: string;
    category_name: string;
}

interface BulkProduct {
    _tempId: string;
    product_name: string;
    product_id?: string;
    imageUrl: string | null;
    categoryId: string;
    activeList: string;
}

export default function ProductForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const [isMounted, setIsMounted] = useState(false);
    const [populated, setPopulated] = useState(true);

    const productId = searchParams.get('productId');
    const isEdit = !!productId;

    const [originalData, setOriginalData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>('');
    const [activeList, setActiveList] = useState('Groceries');

    const { data: fetchedCategories = [], isLoading: categoriesLoading } = useFetchCategories();
    const { data: fetchedProduct, isLoading: productLoading } = useFetchProduct(productId);

    const [formData, setFormData] = useState({
        productId: productId || '',
        productName: '',
        categoryId: '',
        productImage: null as File | null | string,
        formType: isEdit ? 'edit' : 'add'
    });

    // --- NEW BULK IMPORT STATES ---
    const [isDragging, setIsDragging] = useState(false);
    const [bulkProducts, setBulkProducts] = useState<BulkProduct[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    useEffect(() => {
        setIsMounted(true);
        // Emulating React Router's location.state via sessionStorage
        const hasAccess = sessionStorage.getItem('product_form_access');

        if (!hasAccess && !isEdit) {
            // Note: If you want strict enforcement, uncomment the lines below.
            // addToast("Forbidden!", `Please access this page through console products page.`, "destructive");
            // router.push("/dev-mode/products");
            // setPopulated(false);
        } else {
            sessionStorage.removeItem('product_form_access');
        }
    }, [isEdit, router, addToast]);

    // --- BULK IMPORT LOGIC ---
    const processBulkFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (!e.target?.result) return;
                const json = JSON.parse(e.target.result as string);

                // 1. Array Validation
                if (!Array.isArray(json) || json.length === 0) {
                    addToast("Error", "JSON file must contain a valid array of products.", "destructive");
                    return;
                }

                // 2. Strict Schema Validation (The "Wrong File" Check)
                const sampleItem = json[0];
                if (!('product_name' in sampleItem)) {
                    addToast(
                        "Invalid File Format",
                        "This doesn't look like a product list. Ensure your JSON items contain a 'product_name'.",
                        "destructive"
                    );
                    return;
                }

                // 3. Get existing products to check for duplicates
                const cachedData: any = queryClient.getQueryData(["fetchedProducts_Admin"]);
                const existingProducts = Array.isArray(cachedData) ? cachedData : cachedData?.data || [];

                const existingNames = new Set(existingProducts.map((p: any) => p.product_name?.toLowerCase()));

                // 4. Item-Level Validation & Filter
                const validNewProducts = json.filter(item => {
                    if (!item.product_name || typeof item.product_name !== 'string') return false;
                    if (item.imageUrl && typeof item.imageUrl !== 'string') return false;
                    if (item.categoryId && typeof item.categoryId !== 'string') return false;
                    if (existingNames.has(item.product_name.toLowerCase())) {
                        addToast("Warning", `Product ${item.product_name} already exists...`, "destructive");
                        return false;
                    }

                    return true;
                }).map((item, index) => {
                    let inferredActiveList = 'Groceries';
                    let verifiedCategoryId = '';

                    if (item.categoryId) {
                        const matchedCat = fetchedCategories.find((c: Category) => c._id === item.categoryId);

                        if (matchedCat) {
                            verifiedCategoryId = item.categoryId;
                            if (matchedCat.category_list) {
                                inferredActiveList = matchedCat.category_list;
                            }
                        }
                    }

                    return {
                        _tempId: `temp_${Date.now()}_${index}`,
                        product_name: item.product_name,
                        imageUrl: item.imageUrl || null,
                        categoryId: verifiedCategoryId,
                        activeList: inferredActiveList
                    };
                });

                // 5. Final Status Checks
                if (validNewProducts.length === 0) {
                    addToast("Info", "All products in this file already exist in your database, or the data was invalid.", "default");
                    return;
                }

                setBulkProducts(validNewProducts);
                addToast("Success", `Loaded ${validNewProducts.length} new products for review.`, "success");

            } catch (err) {
                addToast("Error", "Failed to parse JSON file.", "destructive");
            }
        };
        reader.readAsText(file);
    };

    // Check if form has changes
    const hasChanges = originalData ?
        JSON.stringify(formData) !== JSON.stringify(originalData) :
        !!(formData.productName && formData.categoryId);

    useEffect(() => {
        if (!productId) {
            setInitialLoading(false);
            return;
        }

        if (productLoading || categoriesLoading) return;

        if (!fetchedProduct) {
            addToast("Redirecting...", "Product not found or fetch failed", "destructive");
            router.push('/dev-mode/products');
            return;
        }

        if (fetchedProduct && fetchedCategories.length > 0) {
            const selectedCategory = fetchedCategories.find((c: Category) =>
                c.category_name === fetchedProduct.category.name &&
                c.category_catalog === fetchedProduct.category.catalog
            );

            const initialFormData = {
                productId: fetchedProduct.product_id,
                productName: fetchedProduct.product_name,
                categoryId: selectedCategory ? selectedCategory._id : '',
                productImage: fetchedProduct.imageUrl || null,
                formType: 'edit'
            };

            if (fetchedProduct.category && fetchedProduct.category.list) {
                setActiveList(fetchedProduct.category.list);
            }

            setFormData(initialFormData);
            setOriginalData(initialFormData);
            setImagePreview(fetchedProduct.imageUrl || '');
            setInitialLoading(false);
        }
    }, [productId, fetchedProduct, fetchedCategories, productLoading, categoriesLoading, router, addToast]);

    useEffect(() => {
        if (!initialLoading) {
            setFormData(prev => ({ ...prev, categoryId: '' }));
        }
    }, [activeList, initialLoading]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleInputChange('productImage', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result || null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedCategory = fetchedCategories.find((c: Category) => c._id === formData.categoryId);
        if (!selectedCategory) {
            addToast("Error", "Please select a valid category.", "destructive");
            return;
        }

        const submitData = new FormData();
        submitData.append('product_id', formData.productId);
        submitData.append('product_name', formData.productName);
        if (formData.productImage) {
            submitData.append('imageUrl', formData.productImage);
        }
        submitData.append('category', JSON.stringify({
            list: selectedCategory.category_list,
            name: selectedCategory.category_name,
            catalog: selectedCategory.category_catalog,
        }));
        submitData.append('formType', formData.formType);

        setLoading(true);
        await ResultAsync
            .fromPromise(
                axios({
                    method: isEdit ? 'put' : 'post',
                    url: isEdit ? `${saveProductUrl}/${productId}` : `${saveProductUrl}`,
                    data: submitData,
                    headers: {
                        Authorization: `Bearer ${Cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error: any) => error.response?.data?.message || "Unable to connect to server. Please try again later."
            )
            .match(
                (axiosResponse) => {
                    const data = axiosResponse.data;
                    const savedProduct = data.product;

                    // v5 strict array syntax
                    queryClient.setQueryData(["fetchedProducts_Admin"], (oldData: any) => {
                        const updateArray = (currentArray: any[]) => {
                            if (isEdit) {
                                return currentArray.map(item =>
                                    item._id === data.product._id ? savedProduct : item
                                );
                            } else {
                                return [savedProduct, ...currentArray];
                            }
                        };

                        if (oldData?.data && Array.isArray(oldData.data)) {
                            return {
                                ...oldData,
                                data: updateArray(oldData.data)
                            };
                        }

                        if (Array.isArray(oldData)) {
                            return updateArray(oldData);
                        }

                        return oldData;
                    });

                    addToast("Success", `Product ${data.product.product_id} successfully created!`, "success");
                    setLoading(false);
                    router.push('/dev-mode/products');
                },
                (errorMessage) => {
                    console.error("Submission failed:", errorMessage);
                    addToast("Error", errorMessage, "destructive");
                    setLoading(false);
                }
            );
    };

    const handleBulkSubmit = async () => {
        if (!bulkProducts) return;

        const isReady = bulkProducts.every(p => p.categoryId !== '');
        if (!isReady) return addToast("Error", "Please assign a category to all products.", "destructive");

        const payload = bulkProducts.map(p => {
            const selectedCategory = fetchedCategories.find((c: Category) => c._id === p.categoryId);
            return {
                product_name: p.product_name,
                imageUrl: p.imageUrl,
                category: selectedCategory ? {
                    list: selectedCategory.category_list,
                    name: selectedCategory.category_name,
                    catalog: selectedCategory.category_catalog,
                } : null
            };
        });

        setLoading(true);
        await ResultAsync
            .fromPromise(
                axios({
                    method: 'post',
                    url: `${saveProductUrl}?bulk=true`,
                    data: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error: any) => error.response?.data?.message || "Bulk import failed."
            )
            .match(
                (axiosResponse) => {
                    // v5 strict object syntax
                    queryClient.invalidateQueries({ queryKey: ["fetchedProducts_Admin"] });
                    addToast("Success", `Bulk imported ${payload.length} products!`, "success");
                    setLoading(false);
                    router.push('/dev-mode/products');
                },
                (errorMessage) => {
                    addToast("Error", errorMessage, "destructive");
                    setLoading(false);
                }
            );
    };

    // --- DATA PROCESSING FOR DROPDOWN ---
    const processedCategories = useMemo(() => {
        if (!fetchedCategories.length) return [];

        const filtered = fetchedCategories.filter((c: Category) => c.category_list === activeList);
        const grouped = filtered.reduce((acc: any, cat: Category) => {
            const catalog = cat.category_catalog;
            if (!acc[catalog]) acc[catalog] = [];
            acc[catalog].push(cat);
            return acc;
        }, {});

        const sortedCatalogs = Object.keys(grouped).sort();

        return sortedCatalogs.map(catalog => ({
            catalogName: catalog,
            items: grouped[catalog].sort((a: Category, b: Category) =>
                a.category_name.localeCompare(b.category_name)
            )
        }));
    }, [fetchedCategories, activeList]);

    // --- DATA PROCESSING FOR DROPDOWN (Bulk) ---
    const groupedCategories = useMemo(() => {
        if (!fetchedCategories.length) return { Groceries: [], Cuisines: [] };

        const processList = (listName: string) => {
            const filtered = fetchedCategories.filter((c: Category) => c.category_list === listName);
            const grouped = filtered.reduce((acc: any, cat: Category) => {
                const catalog = cat.category_catalog;
                if (!acc[catalog]) acc[catalog] = [];
                acc[catalog].push(cat);
                return acc;
            }, {});

            return Object.keys(grouped).sort().map(catalog => ({
                catalogName: catalog,
                items: grouped[catalog].sort((a: Category, b: Category) =>
                    a.category_name.localeCompare(b.category_name)
                )
            }));
        };

        return {
            Groceries: processList('Groceries'),
            Cuisines: processList('Cuisines')
        };
    }, [fetchedCategories]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file && file.type === "application/json") {
                processBulkFile(file);
            } else {
                addToast("Error", "Please drop a valid JSON file.", "destructive");
            }
        }
    };

    if (!isMounted || !populated) return null;

    if (initialLoading || categoriesLoading || productLoading) {
        return (
            <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={"relative flex-1 overflow-auto min-h-screen bg-gray-50"}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* ========================================= */
            /* DRAG & DROP BLUR OVERLAY                 */
            /* ========================================= */}
            {isDragging && (
                <div
                    className="absolute inset-0 z-50 flex w-full h-full items-center justify-center bg-white/60 backdrop-blur-sm"
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-2xl border-2 border-dashed border-orange-400 animate-in zoom-in-95 duration-200">
                        <div className="p-4 bg-orange-100 rounded-full mb-4">
                            <Upload className="h-10 w-10 text-orange-600 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Drop your JSON file</h2>
                        <p className="text-sm text-gray-500 mt-2">Release to parse and review products</p>
                    </div>
                </div>
            )}

            {/* Hidden file input for manual upload */}
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files?.[0]) processBulkFile(e.target.files[0]);
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 py-4 md:py-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {bulkProducts ? 'Bulk Import Review' : (isEdit ? 'Edit Product' : 'Add New Product')}
                    </h1>
                    <p className="mt-1 text-xs md:text-sm text-gray-500">
                        {bulkProducts ? 'Assign categories to your imported products.' : (isEdit ? 'Update product information' : 'Drag a .json file here to bulk import!')}
                    </p>
                </div>
                <div className="flex space-x-2">
                    {!bulkProducts && !isEdit && (
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-2" /> Upload JSON
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dev-mode/products')} className="bg-gray-100">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className={`h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 ${isDragging && 'pointer-events-none'}`} >
                {
                    bulkProducts ? (
                        /* ========================================= */
                        /* BULK IMPORT REVIEW UI                     */
                        /* ========================================= */
                        <div className="space-y-4 overflow-y-auto" >
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold max-md:font-normal text-gray-700">{bulkProducts.length} Products Pending</span>
                                <Button
                                    onClick={handleBulkSubmit}
                                    disabled={loading || !bulkProducts.every(p => p.categoryId)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Confirm & Submit Bulk Import
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bulkProducts.map((product, index) => (
                                    <Card key={product._tempId} className={product.categoryId ? 'border-green-200 bg-green-50/30' : 'border-red-200'}>
                                        <CardContent className="p-4 space-y-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{product.product_name}</h3>
                                                <p className="text-xs font-mono text-gray-500">{product.product_id}</p>
                                            </div>

                                            {/* Toggle specifically for this item */}
                                            <div className="flex space-x-2">
                                                <Button type="button" size="sm" variant={product.activeList === 'Groceries' ? 'default' : 'outline'}
                                                    onClick={() => {
                                                        const updated = [...bulkProducts];
                                                        updated[index].activeList = 'Groceries';
                                                        updated[index].categoryId = '';
                                                        setBulkProducts(updated);
                                                    }}
                                                    className={`!flex-shrink w-full text-xs rounded-lg ${product.activeList === 'Groceries' && 'bg-orange-500'}`}
                                                >
                                                    Groceries
                                                </Button>
                                                <Button type="button" size="sm" variant={product.activeList === 'Cuisines' ? 'default' : 'outline'}
                                                    onClick={() => {
                                                        const updated = [...bulkProducts];
                                                        updated[index].activeList = 'Cuisines';
                                                        updated[index].categoryId = '';
                                                        setBulkProducts(updated);
                                                    }}
                                                    className={`!flex-shrink w-full text-xs rounded-lg ${product.activeList === 'Cuisines' && 'bg-orange-500'}`}
                                                >
                                                    Cuisines
                                                </Button>
                                            </div>

                                            {/* Category Select for this item */}
                                            <Select
                                                value={product.categoryId}
                                                onValueChange={(val) => {
                                                    const updated = [...bulkProducts];
                                                    updated[index].categoryId = val;
                                                    setBulkProducts(updated);
                                                }}
                                            >
                                                <SelectTrigger className={!product.categoryId ? 'ring-2 ring-red-400' : ''}>
                                                    <SelectValue placeholder="Assign Category..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white max-h-64">
                                                    {(groupedCategories as any)[product.activeList]?.length > 0 ? (
                                                        (groupedCategories as any)[product.activeList].map((group: any) => (
                                                            <SelectGroup key={group.catalogName}>
                                                                <SelectLabel className="font-bold text-white bg-gray-600 border-b border-gray-100 py-2 cursor-default">
                                                                    {group.catalogName}
                                                                </SelectLabel>
                                                                {group.items.map((cat: Category) => (
                                                                    <SelectItem
                                                                        key={cat._id}
                                                                        value={cat._id}
                                                                        className="pl-4 bg-white hover:bg-gray-100 cursor-pointer"
                                                                    >
                                                                        {cat.category_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-gray-500">
                                                            No categories found.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ========================================= */
                        /* STANDARD SINGLE PRODUCT FORM UI           */
                        /* ========================================= */
                        <div className="max-w-2xl mx-auto bg-white">
                            <Card>
                                <CardHeader className='flex-row!'>
                                    <CardTitle>Product Information {isEdit && ` - ${formData.productId}`}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">

                                        {/* Product Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="productName">Product Name <span className='text-red-500'>*</span></Label>
                                            <Input
                                                className="hover:bg-orange-100"
                                                id="productName"
                                                value={formData.productName}
                                                onChange={(e) => handleInputChange('productName', e.target.value)}
                                                placeholder="Enter product name"
                                                required
                                            />
                                        </div>

                                        {/* Category Type Toggle */}
                                        <div className="space-y-2 pt-2 border-t">
                                            <Label>Inventory Type</Label>
                                            <div className="flex space-x-2">
                                                <Button
                                                    type="button"
                                                    variant={activeList === 'Groceries' ? 'default' : 'outline'}
                                                    onClick={() => setActiveList('Groceries')}
                                                    className={`${activeList === 'Groceries' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'} !flex-shrink w-full flex items-center justify-center`}
                                                >
                                                    <Store className="w-4 h-4 mr-2" />
                                                    Groceries
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={activeList === 'Cuisines' ? 'default' : 'outline'}
                                                    onClick={() => setActiveList('Cuisines')}
                                                    className={`${activeList === 'Cuisines' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'} !flex-shrink w-full flex items-center justify-center`}
                                                >
                                                    <Utensils className="w-4 h-4 mr-2" />
                                                    Cuisines
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Grouped Category Dropdown */}
                                        <div className="space-y-2">
                                            <Label htmlFor="categoryId">Category <span className='text-red-500'>*</span></Label>
                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={(value) => handleInputChange('categoryId', value)}
                                            >
                                                <SelectTrigger className="hover:bg-orange-100">
                                                    <SelectValue placeholder={`Select a ${activeList.toLowerCase()} category`} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    {processedCategories.length > 0 ? (
                                                        processedCategories.map((group) => (
                                                            <SelectGroup key={group.catalogName}>
                                                                <SelectLabel className="font-bold text-white bg-gray-700 border-b border-gray-100 py-2 cursor-default">
                                                                    {group.catalogName}
                                                                </SelectLabel>
                                                                {group.items.map((category: Category) => (
                                                                    <SelectItem key={category._id} value={category._id} className="pl-4 bg-white hover:bg-gray-200 cursor-pointer">
                                                                        {category.category_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-gray-500">
                                                            No categories found.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Product Image */}
                                        <div className="space-y-2">
                                            <Label htmlFor="productImage">Product Image</Label>
                                            <div className="flex items-center space-x-4">
                                                <Input
                                                    id="productImage"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="flex-1 cursor-pointer hover:bg-orange-100"
                                                />
                                            </div>
                                            {imagePreview && (
                                                <div className="mt-2">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={imagePreview as string}
                                                        alt="Product preview"
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end space-x-4 pt-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.push('/dev-mode/products')}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={!hasChanges || loading}
                                                className={`${!hasChanges ? 'bg-gray-300' : 'bg-blue-600'} hover:bg-blue-700 text-white`}
                                            >
                                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                {isEdit ? 'Update Product' : 'Create Product'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )
                }
            </div>
        </div>
    );
}
