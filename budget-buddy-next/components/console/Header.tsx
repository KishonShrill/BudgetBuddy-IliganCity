"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, ChevronDown, CircleUserRound, House, UserCog } from 'lucide-react';

// Define the TypeScript interfaces
interface User {
    username?: string;
    user_email?: string;
    email?: string; // fallback based on your old propTypes
    [key: string]: any;
}

interface HeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    onLogout?: () => void;
    user?: User | null;
}

export default function Header({ title, actionLabel, onAction, onLogout, user }: HeaderProps) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Safely fallback user data
    const currentUser = user || { username: 'Admin', user_email: 'Loading...' };
    const displayEmail = currentUser.user_email || currentUser.email;

    return (
        <div className="flex flex-col items-start justify-between border-b border-gray-200 bg-white px-8 py-6 relative">

            <div className='flex justify-between w-full'>
                <h1 className="text-3xl leading-10 font-bold text-gray-900">{title}</h1>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-4">

                    {/* Primary Action Button (e.g., "Add Product") */}
                    {onAction && actionLabel && (
                        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Plus className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">{actionLabel}</span>
                        </Button>
                    )}

                    {/* Profile Dropdown */}
                    {onLogout && (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
                            >
                                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                    {currentUser.username?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-700 ml-1">
                                    {currentUser.username}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Invisible overlay to detect clicks outside the dropdown */}
                            {isDropdownOpen && (
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                            )}

                            {/* The Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 overflow-hidden transform origin-top-right transition-all">
                                    {/* User Info Header */}
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {currentUser.username}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {displayEmail}
                                        </p>
                                    </div>

                                    {/* Menu Actions */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => router.push('/budget-hub')}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                            <House className="h-4 w-4 text-gray-400" />
                                            Go Home
                                        </button>
                                        <button
                                            onClick={() => router.push('/profile')}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                            <CircleUserRound className="h-4 w-4 text-gray-400" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => router.push('/dev-mode/users')}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                            <UserCog className="h-4 w-4 text-gray-400" />
                                            Manage Users
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onLogout();
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 text-red-500" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-1 text-start text-sm text-gray-500">
                Manage your {title.toLowerCase()} and their settings
            </p>

        </div>
    );
}

Header.displayName = "Header";
