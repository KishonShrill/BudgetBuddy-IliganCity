"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'universal-cookie';

import Header from '@/components/console/Header';
import DataTable from '@/components/parts/DataTable';
import useFetchLocations from '@/hooks/useFetchLocations';

const cookies = new Cookies();

const columns = [
    { key: 'name', label: 'Location Name', sortable: true },
    { key: 'address', label: 'Address' },
    { key: 'store_hours', label: 'Store Hours' },
    { key: 'open_24_hrs', label: '24 Hours', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'actions', label: 'Actions' },
];

// Define TypeScript interfaces for the expected data structure
interface LocationAddress {
    street: string;
    barangay: string;
    city: string;
}

interface StoreHours {
    open: string;
    close: string;
}

interface LocationItem {
    _id: string;
    location_name: string;
    address: LocationAddress;
    coordinates?: string;
    store_hours: StoreHours;
    is_open_24hrs: string;
    type: string;
}

export default function Locations() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const [decodedUser, setDecodedUser] = useState<any>(null);

    const token = cookies.get("budgetbuddy_token");
    const { isLoading, data } = useFetchLocations();

    useEffect(() => {
        setIsMounted(true);
        if (token) {
            try {
                setDecodedUser(jwtDecode(token));
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, [token]);

    const normalizedData = useMemo(() => {
        if (!data) return [];
        return data.map((item: LocationItem) => ({
            _id: item._id,
            name: item.location_name,
            address: `${item.address.street}, ${item.address.barangay}, ${item.address.city}`,
            map: item.coordinates,
            store_hours: `${item.store_hours.open} - ${item.store_hours.close}`,
            open_24_hrs: item.is_open_24hrs,
            type: item.type
        }));
    }, [data]);

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] });
        router.push("/");
    };

    const handleView = (location: any) => {
        if (location.map) {
            window.open(location.map, '_blank')?.focus();
        } else {
            console.warn("No map coordinates/link available for this location.");
        }
    };

    // Prevent rendering until client hydration is complete
    if (!isMounted) return null;

    return (
        <>
            {/* Hoisted to document <head> by Next.js */}
            <title>BB:Console - Locations</title>

            <div className="flex-1 overflow-auto bg-gray-50 h-full min-w-[320px]">
                <Header
                    title="Locations"
                    actionLabel="Add Location"
                    // Add an empty onAction function or navigation if you want the button to appear
                    // onAction={() => router.push('/dev-mode/locations/new')} 
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <h1 className="text-xl font-bold text-gray-500">Loading locations<span className="animated-dots"></span></h1>
                        : <DataTable
                            data={normalizedData}
                            columns={columns}
                            filterableColumns={['open_24_hrs', 'type']} // Changed 'status' to 'open_24_hrs' based on columns
                            onView={handleView}
                        />
                    }
                </div>
            </div>
        </>
    );
}
