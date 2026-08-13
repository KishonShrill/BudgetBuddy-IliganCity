"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText, Settings, UtensilsCrossed, ShoppingBasket, Home } from "lucide-react";
import { cn } from "@/helpers/utils";

// Optional: Add a TypeScript interface for strictness
interface NavigationItem {
    name: string;
    href: string;
    icon: React.ElementType;
    disabled?: boolean;
}

const navigation: NavigationItem[] = [
    { name: 'Hub', href: '/budget-hub', icon: Home },
    { name: 'Groceries', href: '/locations', icon: ShoppingBasket },
    //{ name: 'Cuisines', href: '#', icon: UtensilsCrossed, disabled: true },
    { name: 'Receipt', href: '/receipt', icon: ReceiptText },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const BottomNavigation = () => {
    // Next.js equivalent of useLocation().pathname
    const pathname = usePathname();

    // Hide the bottom nav on specific routes
    if (new Set(['/', '/authenticate', '/profile', '/budget-hub', '/report', '/locations', '/docs', '/dev-mode']).has(pathname)) {
        return null;
    }

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <footer className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 z-40">
                <nav className="flex flex-1 justify-between">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href} // Changed 'to' to 'href'
                                className={cn(
                                    `flex flex-col items-center px-3 py-4 text-xs font-medium transition-colors min-w-0 grow ${item.disabled && 'bg-red-100 pointer-events-none'}`,
                                    isActive
                                        ? 'text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-5 w-5 mb-1 shrink-0',
                                        isActive ? 'text-blue-500' : (!item.disabled ? 'text-gray-400' : 'text-white')
                                    )}
                                    aria-hidden="true"
                                />
                                <span className={`truncate ${item.disabled && 'text-white select-none'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </footer>
        </>
    );
};

export default BottomNavigation;
