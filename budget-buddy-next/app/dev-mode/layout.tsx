'use client';

import { useEffect } from "react";
import { Suspense } from "react";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";

import Sidebar from "@/components/console/Sidebar";

// Import your global console styles here
// Adjust the path to wherever your SCSS file lives in the Next.js project
import '@/styles/admin_console.scss';

export default function DevModeLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    useEffect(() => {
        const token = Cookies.get("budgetbuddy_token");
        if (!token) redirect("/authenticate");
        console.log("I got in!")
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar remains a persistent shell component */}
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden z-40 relative">
                <main className="flex-1 h-full overflow-y-auto">
                    <Suspense
                        fallback={
                            <div className="flex h-full w-full items-center justify-center">
                                <h2 className="text-lg text-gray-500 font-medium">
                                    Loading<span className="animated-dots"></span>
                                </h2>
                            </div>
                        }
                    >
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
