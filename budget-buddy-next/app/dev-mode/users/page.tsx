"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // v5
import { ResultAsync } from 'neverthrow';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Shield, ShieldAlert, User, Loader2, Mail, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

import Header from '@/components/console/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ToastProvider';
import useFetchConsoleUsers from '@/hooks/useFetchConsoleUsers'; // The new hook

const cookies = new Cookies();
const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;

const API_BASE = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}`;

// 1. Define the strict hierarchy weights
const ROLE_WEIGHTS: Record<string, number> = {
    regular: 1,
    budget_starter: 2,
    wise_spender: 3,
    budget_guru: 4,
    moderator: 5,
    admin: 10
};

// TypeScript Interfaces
interface UserData {
    _id: string;
    username: string;
    email: string;
    role: string;
}

interface DecodedUser {
    user_id: string;
    user_role: string;
    username: string;
    email?: string;
}

export default function ConsoleUsersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const [isMounted, setIsMounted] = useState(false);
    const [currentUser, setCurrentUser] = useState<DecodedUser | null>(null);

    // --- NEW: SEARCH & PAGINATION STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const token = cookies.get("budgetbuddy_token");

    useEffect(() => {
        setIsMounted(true);
        if (token) {
            try {
                setCurrentUser(jwtDecode<DecodedUser>(token));
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, [token]);

    // Reset to page 1 whenever the user searches or changes the items per page
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] });
        router.push("/");
    };

    // --- DATA FETCHING (Via New Custom Hook) ---
    const { data: users = [], isLoading } = useFetchConsoleUsers(token);

    // --- MUTATION FOR CHANGING ROLES ---
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
            const result = await ResultAsync.fromPromise(
                axios.put(`${API_BASE}/users/${userId}/role`, { role: newRole }, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                (error: any) => error.response?.data?.message || "Failed to update user role."
            );

            if (result.isErr()) throw result.error;
            return result.value;
        },
        onSuccess: () => {
            addToast("Success", "User role updated successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ['console_users'] });
        },
        onError: (errMessage: string) => {
            addToast("Error", errMessage, "destructive");
        }
    });

    // --- MUTATION: DELETE USER ---
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const result = await ResultAsync.fromPromise(
                axios.delete(`${API_BASE}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                (error: any) => error.response?.data?.message || "Failed to delete user."
            );

            if (result.isErr()) throw result.error;
            return result.value;
        },
        onSuccess: (res: any) => {
            addToast("Deleted", res.data?.message || "User permanently removed.", "success");
            queryClient.invalidateQueries({ queryKey: ['console_users'] });
        },
        onError: (errMessage: string) => {
            addToast("Error", errMessage, "destructive");
        }
    });

    // --- STRICT RBAC LOGIC HELPERS ---
    const canManageUser = (targetRole: string, targetId: string) => {
        if (!currentUser) return false;
        if (targetId === currentUser.user_id) return false; // Can't change your own role
        return (ROLE_WEIGHTS[currentUser.user_role] || 0) > (ROLE_WEIGHTS[targetRole] || 0);
    };

    const getAssignableRoles = () => {
        if (!currentUser) return [];
        // You can only assign roles that have a strictly LOWER weight than your own
        return Object.keys(ROLE_WEIGHTS).filter(
            (role) => ROLE_WEIGHTS[role] < (ROLE_WEIGHTS[currentUser.user_role] || 0)
        );
    };

    const assignableRoles = getAssignableRoles();

    const filteredUsers = useMemo(() => {
        return users
            .filter((user: UserData) =>
                user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a: UserData, b: UserData) => {
                if (!currentUser) return 0;
                if (a._id === currentUser.user_id) return -1; // Move 'a' up if it's you
                if (b._id === currentUser.user_id) return 1;  // Move 'b' up if it's you
                return 0; // Keep everyone else in their original order
            });
    }, [users, searchQuery, currentUser]);

    // 2. Calculate pagination slices
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <>
            <Header
                title="Manage Users"
                // subtitle="Manage clearance levels and platform access." // Ensure Header prop accepts this if you kept it
                onLogout={logout}
                user={currentUser}
            />
            <div className="h-[calc(100vh-120px-72px)] md:h-[calc(100vh-120px)] overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto">

                {/* SEARCH BAR */}
                <div className="relative w-full md:w-80 mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white focus-visible:ring-orange-500"
                    />
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden bg-white py-0 gap-0">
                    <CardHeader className="bg-gray-50 border-b border-gray-100 px-6 py-6">
                        <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-orange-500" />
                            Registered Users ({users.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {currentUsers.map((user: UserData) => {
                                const isManageable = canManageUser(user.role, user._id);

                                return (
                                    <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-6 max-sm:py-3 hover:bg-gray-50/50 transition-colors">

                                        {/* User Info */}
                                        <div className="overflow-x-auto flex items-center gap-4 mb-4 max-sm:mb-2 sm:mb-0">
                                            <div className="h-12 w-12 rounded-full bg-orange-100 max-lg:hidden flex items-center justify-center flex-shrink-0">
                                                {user.role === 'admin' ? <ShieldAlert className="text-orange-600 h-6 w-6" /> :
                                                    user.role === 'moderator' ? <Shield className="text-orange-500 h-6 w-6" /> :
                                                        <User className="text-gray-500 h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 capitalize">{user.username.toLowerCase()}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions Container */}
                                        <div className="flex items-center gap-3">
                                            {/* Role Dropdown */}
                                            <div className="w-40 sm:w-48">
                                                <Select
                                                    disabled={!isManageable || updateRoleMutation.isPending}
                                                    value={user.role}
                                                    onValueChange={(newRole) => {
                                                        if (newRole !== user.role) {
                                                            updateRoleMutation.mutate({ userId: user._id, newRole });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className={`w-full capitalize ${!isManageable ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white hover:border-orange-400 focus:ring-orange-500'}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-white'>
                                                        <SelectItem value={user.role} className="capitalize font-medium">
                                                            {user.role.replaceAll("_", " ")}
                                                        </SelectItem>
                                                        {isManageable && assignableRoles.map((role) => (
                                                            role !== user.role && (
                                                                <SelectItem key={role} value={role} className="capitalize bg-white hover:bg-gray-100 cursor-pointer">
                                                                    {role.replaceAll("_", " ")}
                                                                </SelectItem>
                                                            )
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Delete Button (Admins Only) */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 transition-colors"
                                                disabled={deleteUserMutation.isPending || !currentUser || ROLE_WEIGHTS[user.role] >= ROLE_WEIGHTS[currentUser.user_role]}
                                                onClick={() => {
                                                    if (window.confirm(`WARNING: Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`)) {
                                                        deleteUserMutation.mutate(user._id);
                                                    }
                                                }}
                                                title="Delete User"
                                            >
                                                {deleteUserMutation.isPending && deleteUserMutation.variables === user._id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    {searchQuery ? `No users found matching "${searchQuery}"` : "No users found in the database."}
                                </div>
                            )}
                        </div>

                        {/* PAGINATION FOOTER - Only renders if there are more than 10 users */}
                        {filteredUsers.length > 10 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 bg-gray-50/80 gap-4 sm:gap-0">

                                {/* Items Per Page */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Show</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={(v) => setItemsPerPage(Number(v))}
                                    >
                                        <SelectTrigger className="w-[70px] h-8 bg-white focus:ring-orange-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span>entries</span>
                                </div>

                                {/* Page Controls */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div >
        </>
    );
}

// Renamed slightly to avoid conflicts with 'lucide-react' User icon if needed
function UsersIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
