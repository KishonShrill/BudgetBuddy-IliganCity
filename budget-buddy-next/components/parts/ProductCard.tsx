"use client";

import React from "react";
import Image from "next/image";
import { Package, MapPin, Clock, Tag, Plus } from "lucide-react";
import { mongoDateToText } from "@/helpers/date";
import useSettings from "@/hooks/useSettings";

export interface ProductItem {
    _id: string;
    product: {
        product_id?: string;
        product_name: string;
        imageUrl?: string;
    };
    updated_price: number;
    date_updated: string;
    location: {
        id?: string;
        name: string;
    };
    category?: {
        catalog: string;
    };
}

interface ProductCardProps {
    item: ProductItem;
    onAdd?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onViewHistory?: (item: ProductItem) => void;
}

const ProductCard = ({ item, onAdd, onViewHistory }: ProductCardProps) => {
    const { settings } = useSettings();

    return (
        <div
            className={`product-card ${!settings.hidePhotos && 'grid-cols-2'} ${onViewHistory ? 'cursor-pointer' : ''} group max-sm:grid max-sm:gap-3 flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm transition-all duration-300 hover:shadow-lg dark:hover:shadow-orange-900/10 dark:hover:border-gray-700`}
            data-product-id={item._id}
            data-product-name={item.product.product_name}
            data-product-price={item.updated_price}
            onClick={() => onViewHistory?.(item)}
            title={onViewHistory ? "View Price History" : undefined}
        >
            {!settings.hidePhotos && (
                <div className="relative h-full aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
                    {item.product.imageUrl ? (
                        <Image
                            src={item.product.imageUrl}
                            alt={item.product.product_name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            draggable={false}
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="relative h-full">
                            <div className="flex h-full items-center justify-center bg-[#ffccaa] dark:bg-orange-900/20">
                                <Package className="w-16 h-16 text-gray-400 dark:text-orange-500/50" />
                            </div>
                        </div>
                    )}

                    {/* Floating Location Tag */}
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                        <MapPin size={10} className="text-orange-400" />
                        <span className="max-w-[100px] truncate">{item.location.name.split(' - ')[0]}</span>
                    </div>
                </div>
            )}

            <div className="sm:mt-4 flex flex-1 flex-col">
                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-800 dark:text-gray-100">
                    {item.product.product_name}
                </h3>

                <div className="my-2 flex flex-wrap gap-x-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> {mongoDateToText(item.date_updated)}
                    </span>
                    {item?.category?.catalog && (
                        <span className="flex items-center gap-1 text-blue-500 dark:text-blue-400">
                            <Tag size={12} /> {item.category.catalog}
                        </span>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price</span>
                        <span className="text-lg font-black text-orange-500 dark:text-orange-400">
                            ₱{item.updated_price.toFixed(2)}
                        </span>
                    </div>

                    {onAdd && (
                        <button
                            data-product-id={item._id}
                            data-product-name={item.product.product_name}
                            data-product-price={item.updated_price}
                            data-product-location={item.location.name}
                            data-product-image={item.product.imageUrl}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevents triggering onViewHistory when clicking 'Add'
                                onAdd(e);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 dark:bg-orange-600 text-white shadow-md dark:shadow-orange-900/20 transition-transform hover:scale-110 hover:bg-orange-600 dark:hover:bg-orange-500 active:scale-95"
                            aria-label="Add to cart"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);
