"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import Cart from "@/components/parts/Cart";
import ProductCard from '@/components/parts/ProductCard';
import Searchbar from "@/components/parts/Searchbar";
import SimpleFooter from "@/components/parts/SimpleFooter";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { addToCart, removeFromCart, updateQuantity, clearLocation, clearAll } from "@/redux/cartSlice";

import useSettings from "@/hooks/useSettings";
import useFetchListingsByLocation from '@/hooks/useFetchListingsByLocation';
import { useToast } from "@/components/ToastProvider";

interface GroceryClientProps {
    locationId: string;
}

export default function GroceryClient({ locationId }: GroceryClientProps) {
    const { settings } = useSettings();
    const { addToast } = useToast();
    const dispatch = useDispatch();

    const [count, setCount] = useState(0);
    const [receiptVisible, setReceiptVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [animatingCards, setAnimatingCards] = useState<any[]>([]);
    const [selectedCatalog, setSelectedCatalog] = useState('All');
    const [windowWidth, setWindowWidth] = useState(0);

    // --- Pagination State ---
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const cartButtonRef = useRef<HTMLButtonElement>(null);
    const cartRef = useRef<any>(null);
    const searchbarRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const cartItems = useSelector((state: RootState) => state.cart.items);

    const { isLoading, data, isError, error, isFetching } = useFetchListingsByLocation(locationId);

    // Handle Window Width for animation targets
    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Save cart to local storage
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Load itemsPerPage from session storage to persist across reloads
    useEffect(() => {
        const savedLimit = sessionStorage.getItem('budgetbuddy_itemsPerPage');
        if (savedLimit) {
            setItemsPerPage(Number(savedLimit));
        }
    }, []);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCatalog]);

    const catalogs = useMemo(() => {
        if (!data?.products) return [];
        const uniqueCatalogs = new Set<string>();
        data.products.forEach((item: any) => {
            if (item.category?.catalog) uniqueCatalogs.add(item.category.catalog);
        });
        return Array.from(uniqueCatalogs).sort();
    }, [data]);

    const handleClick = useCallback((el: HTMLElement) => {
        const { productId, productName, productPrice, productLocation, productImage } = el.dataset;
        const price = parseFloat(productPrice || "0");

        const card = el.closest('.product-card');
        const cartButton = (windowWidth < 768) ? cartButtonRef.current : cartRef.current;

        if (!card || !cartButton) return;

        if (audioRef.current && settings.soundEffects) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }

        const cardRect = card.getBoundingClientRect();
        const cartShape = cartButton.getBoundingClientRect();

        dispatch(addToCart({
            id: productId!,
            name: productName!,
            price: parseFloat(productPrice!),
            location: productLocation!,
            image: productImage!
        }));

        const animatingCard = {
            count,
            productId,
            productName,
            productPrice: price,
            productImage,
            startX: cardRect.left,
            startY: cardRect.top,
            targetX: cartShape.left + cartShape.width / 2 - 80,
            targetY: cartShape.top + cartShape.height / 2 - 100,
        };

        setCount(prev => prev + 1);
        setAnimatingCards(prev => [...prev, animatingCard]);

        setTimeout(() => {
            setAnimatingCards(prev => prev.filter(c => c.count !== animatingCard.count));
        }, 800);

    }, [count, windowWidth, settings.soundEffects, dispatch]);

    const filteredProducts = useMemo(() => {
        const term = search.toLowerCase();
        return data?.products.filter((item: any) => {
            const matchesSearch = term === '' || item.product.product_name?.toLowerCase().includes(term);
            const matchesCatalog = selectedCatalog === 'All' || item.category?.catalog === selectedCatalog;
            return matchesSearch && matchesCatalog;
        }) || [];
    }, [data, search, selectedCatalog]);

    // --- Pagination Computations ---
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        // Also ensure alphabetical sorting is maintained
        return [...filteredProducts]
            .sort((a: any, b: any) => a.product.product_name.localeCompare(b.product.product_name))
            .slice(start, end);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(e.target.value);
        setItemsPerPage(newLimit);
        setCurrentPage(1); // Reset to first page
        sessionStorage.setItem('budgetbuddy_itemsPerPage', String(newLimit));
    };

    const totalQty = Object.values(cartItems).reduce((sum, item: any) => sum + item.quantity, 0);

    return (
        <div className="h-[calc(100dvh-134px)] md:h-[calc(100dvh-65px)] overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Audio Element */}
            <audio ref={audioRef} src="/sounds/click-pop.mp3" preload="auto" />

            {/* Sticky Header */}
            <div className={`sticky top-0 ${!receiptVisible ? "z-[21]" : "z-0"} dark:bg-gray-900/80 backdrop-blur-md p-2 flex w-full gap-2 items-center justify-center max-w-400 mx-auto`}>
                <Searchbar
                    ref={searchbarRef}
                    type="text"
                    placeholder="Search products..."
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Link href="/locations" className="p-2 rounded-md border-2 border-transparent bg-white dark:bg-[#ee4d2d] dark:hover:bg-[#d63916] hover:border-[#ee4d2d] transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
                    <ArrowLeft className="w-6 h-6 dark:text-white" />
                </Link>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex overflow-x-auto gap-2 px-5 py-4 scrollbar-hide bg-gray-50 dark:bg-gray-900 max-w-400 mx-auto">
                <Button
                    variant={selectedCatalog === 'All' ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full whitespace-nowrap transition-all ${selectedCatalog === 'All' ? 'bg-[#ee4d2d] hover:bg-[#d63916] text-white border-transparent' : 'bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
                    onClick={() => setSelectedCatalog('All')}
                >
                    All Items
                </Button>

                {catalogs.map(catalog => (
                    <Button
                        key={catalog}
                        variant={selectedCatalog === catalog ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-full whitespace-nowrap transition-all ${selectedCatalog === catalog ? 'bg-[#ee4d2d] hover:bg-[#d63916] text-white border-transparent' : 'bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
                        onClick={() => setSelectedCatalog(catalog)}
                    >
                        {catalog}
                    </Button>
                ))}
            </nav>

            {/* ✨ MAIN FLEX LAYOUT ✨ */}
            <div className="flex flex-col md:flex-row gap-6 px-5 pb-8 relative max-w-400 mx-auto items-start z-20">

                {/* LEFT SIDE: Product Grid */}
                <section className="flex-1 min-w-0 transition-colors">

                    {isLoading || isFetching ? (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <h2 className="text-2xl font-bold dark:text-white">Loading<span className="animated-dots"></span></h2>
                        </div>
                    ) : isError ? (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <h2 className="text-red-500 font-medium">Error: {error?.message}</h2>
                        </div>
                    ) : (
                        <>
                            {/* Pagination Settings & Summary Header */}
                            {filteredProducts.length > 0 && (
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="perPage" className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Per page:
                                        </label>
                                        <select
                                            id="perPage"
                                            value={itemsPerPage}
                                            onChange={handleLimitChange}
                                            className="text-xs sm:text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1 outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] transition-colors"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Products Grid */}
                            <main className={`grid ${!settings.hidePhotos ? 'max-sm:grid-cols-1' : 'grid-cols-2'} grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6`}>
                                {paginatedProducts.map((item: any) => (
                                    <ProductCard
                                        key={item._id}
                                        item={item}
                                        onAdd={(event) => handleClick(event.currentTarget)}
                                    />
                                ))}
                            </main>

                            {/* Empty State when no products match the search filter */}
                            {filteredProducts.length === 0 && (
                                <div className="py-20 text-center w-full">
                                    <p className="text-gray-500 dark:text-gray-400">No products found for <b className="text-[#ee4d2d]">{search}</b></p>
                                    <Button
                                        variant="outline"
                                        className="mt-6 border-[#ee4d2d] text-[#ee4d2d] hover:bg-[#ee4d2d] hover:text-white"
                                        onClick={() => {
                                            setSearch('');
                                            if (searchbarRef.current) searchbarRef.current.value = '';
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}

                            {/* Bottom Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                    </Button>

                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-12 flex flex-wrap justify-center gap-x-1 text-gray-500 dark:text-gray-400">
                        <p className="text-center">Don&apos;t see the product you&apos;re looking for?</p>
                        <Link href="/contribution" className="text-orange-500 hover:font-bold">Contribute with us</Link>
                    </div>
                </section>

                {/* RIGHT SIDE: Cart Sidebar / Mobile Overlay */}
                <Cart
                    ref={cartRef}
                    storage={{ cart: cartItems }}
                    onRemove={(id) => dispatch(removeFromCart(id))}
                    onUpdateQuantity={(id, q) => dispatch(updateQuantity({ id, quantity: q }))}
                    onRemoveLocation={(loc) => dispatch(clearLocation(loc))}
                    onRemoveAll={() => dispatch(clearAll())}
                    receipt={receiptVisible}
                    addToast={addToast}
                />
            </div>

            {/* Animation Overlay */}
            {animatingCards.map((card) => (
                <div
                    key={card.count}
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: card.startX,
                        top: card.startY,
                        width: '160px',
                        height: '200px',
                        animation: `flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                        ['--start-x' as any]: `${card.startX}px`,
                        ['--start-y' as any]: `${card.startY}px`,
                        ['--target-x' as any]: `${card.targetX}px`,
                        ['--target-y' as any]: `${card.targetY}px`,
                    }}
                >
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
                        {card.productImage && (
                            <div className="relative aspect-square h-38 bg-gray-50">
                                <Image src={card.productImage} alt="" fill className="object-cover" unoptimized />
                            </div>
                        )}
                        <div className="p-2">
                            <h3 className="line-clamp-1 text-[10px] font-bold text-gray-800">{card.productName}</h3>
                            <p className="text-xs font-black text-orange-500">₱{card.productPrice.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            ))}

            {/* Mobile Cart Button with Redux Quantity Badge */}
            <button
                ref={cartButtonRef}
                onClick={() => setReceiptVisible(!receiptVisible)}
                className={`fixed bottom-20 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#ee4d2d] text-white shadow-lg transition-transform active:scale-95 md:hidden`}
            >
                <Package className="w-6 h-6" />
                {totalQty > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
                        {totalQty}
                    </span>
                )}
            </button>

            <SimpleFooter className="bg-gray-900" />
        </div>
    );
}
