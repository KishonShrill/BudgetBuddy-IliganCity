"use client"; // Required because of the scroll useEffect

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Hero from "@/components/homepage/Hero";
import Features from "@/components/homepage/Features";
import About from "@/components/homepage/About";
import HowItWorks from "@/components/homepage/HowItWorks";
import Footer from "@/components/homepage/Footer";

// NOTE: Metadata usually goes in a Server Component. 
// Since this page needs "use client", you should move the metadata 
// to app/layout.tsx or a separate server-side page file.

export default function HomePage() {
    const pathname = usePathname();

    useEffect(() => {
        // Next.js doesn't natively expose the hash (#) in the navigation hooks easily
        // so we check the standard window object.
        const hash = window.location.hash;

        if (hash) {
            const id = hash.substring(1);
            // Small delay to ensure the DOM is painted
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 150);
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    }, [pathname]); // Triggers on route change

    return (
        <main id="homepage" className="relative w-full">
            <Hero />
            <Features />
            <About />
            <HowItWorks />
            <Footer />
        </main>
    );
}

