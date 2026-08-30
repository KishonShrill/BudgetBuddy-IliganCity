import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ToastProvider";
import Providers from "@/components/Providers";
import "./globals.css";

import MainBottomNav from "@/components/parts/MainBottomNav";
import Header from "@/components/homepage/Header";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: 'Budget Buddy Iligan City',
        template: '%s | Budget Buddy Iligan City'
    },
    description: "A budget expense tracker, budgeting, and price checking to enhance the livelihood and habits of the Iligan city people",
    openGraph: {
        siteName: 'BetterIligan',
        locale: 'en_PH',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${inter.className} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                <Providers>
                    <ToastProvider>
                        <Header />
                        <main className="min-h-[calc(100dvh-65px)] overflow-y-auto dark:bg-gray-800">{children}</main>
                        <MainBottomNav />
                    </ToastProvider>
                </Providers>
            </body>
        </html>
    );
}
