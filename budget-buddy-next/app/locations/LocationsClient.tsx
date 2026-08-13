"use client";

import useFetchLocations from '@/hooks/useFetchLocations';
import LocationCard from "@/components/parts/LocationCard";
import SimpleFooter from "@/components/parts/SimpleFooter";
import Link from 'next/link';
import { ServerCrash, AlertCircle } from 'lucide-react';


export default function LocationsClient() {
    // This hook will now find the data PRE-LOADED in the cache!
    const { data: locations, isError } = useFetchLocations();

    return (
        <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="min-h-[calc(100vh-129px-62px)]">
                <section className="mx-auto max-w-6xl py-6 px-4 lg:p-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 md:text-5xl">
                            Select a <span className="text-orange-500">Store</span>
                        </h1>
                        <p className="mt-3 text-gray-500">Choose a location to start building your budget.</p>
                    </div>

                    <main className="grid max-md:gap-4 gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {isError || !locations || locations.length === 0 ? (
                            <LocationFallback
                                isError={isError}
                            />
                        ) : (
                            locations.map((item: any) => (
                                <LocationCard key={item._id} item={item} />
                            ))
                        )}
                    </main>

                    <div className="mt-12 flex flex-wrap justify-center gap-x-1 text-gray-600 dark:text-gray-400">
                        <p className="text-center">Don&apos;t see your nearest location?</p>
                        <Link href="/report" className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:font-bold transition-all">
                            Report it to us
                        </Link>
                        <p>now!</p>
                    </div>
                </section>
            </div>
            <SimpleFooter className="bg-gray-900" />
        </div>
    );
}

const LocationFallback = ({ isError }: { isError: boolean }) => {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center transition-colors">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${isError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {isError ? (
                    <ServerCrash className="w-10 h-10 text-red-500 dark:text-red-400" />
                ) : (
                    <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isError ? "Connection Error" : "No Locations Found"}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                {isError
                    ? "We couldn't connect to the database. It might be offline or undergoing maintenance. Please try again in a few moments."
                    : "There are currently no locations available to display."}
            </p>

            {isError && (
                // We use a standard anchor tag here to force a hard reload of the page to re-trigger the Server-Side fetch
                <a
                    href="/locations"
                    className="bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] hover:shadow-lg hover:shadow-orange-900/20 text-white px-8 py-2 rounded-md font-medium shadow-sm transition-all duration-300 hover:scale-105"
                >
                    Refresh Page
                </a>
            )}
        </div>
    );
};
