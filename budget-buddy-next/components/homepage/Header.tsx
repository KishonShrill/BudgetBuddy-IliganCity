"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Settings, Menu, X, LayoutDashboard, Package, ShoppingCart, Computer, CircleUserRound, Scroll, ChevronDown, Wallet } from "lucide-react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

import useFetchListingsByLocation from '@/hooks/useFetchListingsByLocation';

const cookies = new Cookies();

interface JwtPayload {
    user_id: string;
    user_email: string;
    user_role: string;
    username: string;
    profile_picture: string;
}

interface NavLink {
    to: string;
    label: string;
    icon: React.ReactNode;
    disabled?: boolean;
    isDropdown?: boolean;
    subLinks?: Array<{
        to: string;
        label: string;
        icon: React.ReactNode;
        disabled?: boolean;
    }>;
}

const Header = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState<string | undefined>(cookies.get("budgetbuddy_token"));

    const pathname = usePathname();
    const currentLocation = pathname || '/';
    const headerRef = useRef<HTMLElement>(null);
    let isAdvancedUser = false;

    // 1. Define routes where we DO NOT want to fetch location data
    const excludedRoutes = new Set([
        '/', '/authenticate', '/profile', '/budget-hub',
        '/report', '/locations', '/docs', '/dev-mode'
    ]);

    // Check if the current route should skip the fetch
    const isExcluded = excludedRoutes.has(currentLocation);

    // 2. Extract the location ID from the URL safely
    const getLocationId = () => {
        const pathParts = currentLocation.split('/');
        if (pathParts[1] === 'locations' && pathParts[2]) return decodeURIComponent(pathParts[2]);
        return null;
    };

    const locationId = getLocationId();

    // 3. Call the hook unconditionally, but pass null if excluded
    const { data: fetchedData } = useFetchListingsByLocation(isExcluded ? null : locationId);

    // 4. Force data to be strictly null on excluded routes
    const data = isExcluded || !fetchedData ? null : fetchedData;

    //const locationTitle = currentLocation.split('/')[1];

    if (token) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const role = decoded.user_role;
            isAdvancedUser = role === "admin" || role === "moderator";
        } catch (error) {
            console.error("Failed to decode token", error);
        }
    }

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        setIsOpen(false);
        cookies.remove("budgetbuddy_token", { path: "/" });
        setToken(undefined);
        router.push("/");
        setTimeout(() => {
            router.refresh();
        }, 100);
    };

    const navLinks: NavLink[] = [
        { to: "/", label: "Home", icon: <LayoutDashboard size={20} /> },
        ...(token
            ? [{ to: "/contribution", label: "Contribute", icon: <Scroll size={20} /> }]
            : []),
        ...(token
            ? [{
                to: "/budget-hub",
                label: "Budget Hub",
                icon: <Wallet size={20} />,
                isDropdown: true,
                subLinks: [
                    { to: "/locations", label: "Groceries", icon: <Package size={18} /> },
                    { to: "/receipt", label: "Receipt", icon: <ShoppingCart size={18} /> },
                ]
            }]
            : [
                { to: "/locations", label: "Groceries", icon: <Package size={18} /> },
                { to: "/receipt", label: "Receipt", icon: <ShoppingCart size={18} /> }
            ]),
    ];

    const checkIsActive = (path: string) => {
        if (path === "/") return pathname === "/";
        if (path === "#") return false;
        return pathname.startsWith(path);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (isOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleCookieChange = (changeEvent: any) => {
            if (changeEvent.name === "budgetbuddy_token") {
                setToken(changeEvent.value);
            }
        };

        cookies.addChangeListener(handleCookieChange);
        return () => {
            cookies.removeChangeListener(handleCookieChange);
        };
    }, []);

    const activeStyles = "!text-orange-500 font-bold";
    const inactiveStyles = "text-gray-600 dark:text-gray-300";
    const keepWidthStyles = "inline-flex flex-col after:content-[attr(data-text)] after:font-bold after:h-0 after:invisible after:overflow-hidden after:select-none";

    // Hide header entirely in Dev Mode
    if (pathname.startsWith('/dev-mode')) return null;

    return (
        <header ref={headerRef} className="header sticky top-0 flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-30">

            {/* LEFT: Logo & Desktop Title */}
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Go to homepage">
                <Image src="/budgetbuddy-logo.svg" width={36} height={36} className='rounded-full object-cover shadow-sm select-none' alt="Budget Buddy Logo" />
                <span className={`inter-bold text-xl text-orange-500 dark:text-white ${currentLocation !== '/' && 'hidden'}`}>Budget Buddy</span>
            </Link>

            {/* CENTER: Dynamic Location Title */}
            <div className="flex-1 flex justify-center md:justify-start text-center px-4 min-w-0">
                {!isExcluded && (data?.location_name || locationId) && (
                    <h1 className="truncate text-sm md:text-base capitalize font-bold py-1 px-2 rounded-lg text-white bg-orange-500">
                        {data?.location_name || decodeURIComponent(locationId as string)}
                    </h1>
                )}
            </div>

            {/* RIGHT: Menu Button (Mobile) */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <button
                    className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Navigation Overlay */}
            <nav className={`
                absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white/95 backdrop-blur-xl dark:bg-gray-800/95 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-4 transition-all duration-200 origin-top
                md:static md:flex md:p-0 md:bg-transparent md:border-none md:shadow-none md:mt-0 md:backdrop-blur-none md:w-auto
                ${isOpen
                    ? "scale-y-100 opacity-100 pointer-events-auto visible"
                    : "scale-y-95 opacity-0 pointer-events-none invisible md:scale-y-100 md:opacity-100 md:pointer-events-auto md:visible"}
            `}>
                <ul className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
                    {/* Dynamic Links */}
                    {navLinks.map((link) => (
                        <li key={link.label} className={link.isDropdown ? "relative group" : ""}>
                            <Link
                                title={link.disabled ? `Coming soon...` : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-200 md:hover:bg-transparent dark:md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 ${link.disabled && 'opacity-50 pointer-events-none'} ${checkIsActive(link.to) ? activeStyles : inactiveStyles}`}
                                href={link.to}
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="md:hidden">{link.icon}</span>
                                <span data-text={link.label} className={`flex items-center ${keepWidthStyles}`}>
                                    <div className="flex items-center gap-2 inter-regular">
                                        {link.label}
                                        {link.isDropdown && <ChevronDown size={14} className="hidden md:block transition-transform duration-200 group-hover:rotate-180" />}
                                    </div>
                                </span>
                            </Link>

                            {/* Dropdown Menu */}
                            {link.isDropdown && link.subLinks && (
                                <div className="
                                    md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:pt-4
                                    md:opacity-0 md:invisible 
                                    md:group-hover:opacity-100 md:group-hover:visible 
                                    md:group-focus-within:opacity-100 md:group-focus-within:visible 
                                    transition-all duration-200 z-30
                                ">
                                    <div className="absolute top-0 left-0 w-full h-4 hidden md:block"></div>
                                    <ul className="
                                        flex flex-col gap-1 mt-2 ml-9 md:ml-0 md:mt-0
                                        md:bg-white md:dark:bg-gray-800 md:border md:border-gray-100 md:dark:border-gray-700 md:shadow-xl md:rounded-2xl md:p-2 md:w-48
                                    ">
                                        {link.subLinks.map((sub) => (
                                            <li key={sub.label}>
                                                <Link
                                                    title={sub.disabled ? `Coming soon...` : undefined}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-500 ${sub.disabled && 'opacity-50 pointer-events-none'} ${checkIsActive(sub.to) ? 'text-orange-500! font-bold bg-orange-50 dark:bg-gray-700/50' : inactiveStyles}`}
                                                    href={sub.to}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <span className="text-gray-400 dark:text-gray-500">{sub.icon}</span>
                                                    <span className="text-sm font-medium">{sub.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}

                    {/* Auth Section - Replaced Icons with Text Buttons */}
                    <div className="flex flex-col md:flex-row md:items-center md:border-l border-gray-200 dark:border-gray-600 mt-2 pt-2 md:mt-0 md:pt-0 md:pl-4 gap-2 md:gap-3">
                        <hr className="mb-2 md:hidden border-gray-200 dark:border-gray-700" />

                        <Link
                            className={`nav-link flex items-center gap-3 px-3 py-2 md:p-0 rounded-xl transition-colors hover:bg-gray-200 md:hover:bg-transparent dark:md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 ${checkIsActive("/settings") ? activeStyles : inactiveStyles}`}
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            title="Settings"
                        >
                            <Settings size={20} />
                            <span className="md:hidden font-medium">Settings</span>
                        </Link>

                        {!checkIsActive("/authenticate") && (!token ? (
                            <Link
                                className="flex items-center justify-center px-5 py-2 rounded-full font-bold transition-all bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-sm md:ml-2"
                                href="/authenticate"
                                onClick={() => setIsOpen(false)}
                            >
                                Log In
                            </Link>
                        ) : (
                            <>
                                {isAdvancedUser && (
                                    <Link
                                        className={`nav-link flex items-center gap-3 px-3 py-2 md:p-0 rounded-xl transition-colors hover:bg-gray-200 md:hover:bg-transparent dark:md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 font-medium ${checkIsActive("/dev-mode") ? activeStyles : inactiveStyles}`}
                                        href="/dev-mode"
                                        onClick={() => setIsOpen(false)}
                                        title="Dev Mode"
                                    >
                                        <Computer size={20} />
                                        <span className="md:hidden font-medium">Dev Mode</span>
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center px-4 py-2 mt-2 md:mt-0 rounded-full font-bold transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 md:ml-2"
                                >
                                    Log Out
                                </button>
                            </>
                        ))}
                    </div>
                </ul>
            </nav>
        </header>
    );
};

Header.displayName = "Header";

export default React.memo(Header);
