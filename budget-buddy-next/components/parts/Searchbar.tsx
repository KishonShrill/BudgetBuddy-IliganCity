"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/helpers/utils";

interface SearchbarProps {
    type: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
}

const Searchbar = forwardRef<HTMLInputElement, SearchbarProps>(
    ({ type, placeholder = "Search", children, onChange }, ref) => {
        return (
            <div className="flex w-full items-center gap-2">
                <div
                    className={cn(
                        "relative flex flex-1 items-center w-full z-[2]",
                        "rounded-[7px] border border-transparent",
                        "bg-white shadow-[0_2px_5px_rgba(0,0,0,0.1)]",
                        "transition-all duration-200",
                        "dark:bg-gray-800 dark:border-gray-700",
                        // The custom focus-within glow from smoothshadows.com
                        "focus-within:border-[#ee4d2d] focus-within:shadow-[0px_0px_5px_rgba(238,77,45,0.09),0px_0px_21px_rgba(238,77,45,0.18)]"
                    )}
                >
                    <Image
                        className="ml-3 opacity-50 dark:invert"
                        height={20}
                        width={20}
                        src="/UI/search-01-stroke-rounded.svg"
                        alt="Search"
                    />
                    <input
                        ref={ref}
                        className={cn(
                            "grow w-full h-full",
                            "py-[0.6rem] px-2 text-[1.1rem]",
                            "bg-transparent border-none outline-none focus:outline-none",
                            "rounded-r-[7px]",
                            "text-gray-900 dark:text-white",
                            "placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        )}
                        type={type}
                        placeholder={placeholder}
                        onChange={onChange}
                    />
                </div>
                {children}
            </div>
        );
    }
);

Searchbar.displayName = "Searchbar";

export default Searchbar;
