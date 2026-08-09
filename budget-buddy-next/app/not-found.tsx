import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';
import { Metadata } from 'next';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = {
    title: 'Page not found | Budget Buddy',
    description: 'This site does not exist or has been moved.',
};

export default function NotFound() {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center px-4 overflow-hidden relative min-h-[calc(100vh-76px)] transition-colors duration-300">

            {/* Background Ambient Glows */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[80px] animate-pulse pointer-events-none -z-10"></div>
            <div
                className="absolute bottom-20 right-10 w-80 h-80 bg-orange-400/10 dark:bg-orange-400/5 rounded-full blur-[100px] animate-pulse pointer-events-none -z-10"
                style={{ animationDelay: '1000ms' }}
            ></div>

            <div className="flex flex-col justify-center max-w-2xl mx-auto text-center z-10 w-full py-12">

                {/* Animated 404 Hero */}
                <div className="relative mb-6 sm:mb-10 w-full flex justify-center">
                    <div className="text-[8rem] sm:text-[12rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-[#ff6b47] leading-none drop-shadow-sm select-none">
                        404
                    </div>

                    {/* Floating Orbs (Using inline styles for guaranteed animation delays) */}
                    <div className="absolute top-1/4 left-[15%] sm:left-[20%] animate-bounce">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-[#ff6b47] rounded-full opacity-60 shadow-lg shadow-orange-500/30"></div>
                    </div>
                    <div
                        className="absolute top-1/3 right-[15%] sm:right-[20%] animate-bounce"
                        style={{ animationDelay: '300ms' }}
                    >
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-50 shadow-lg shadow-orange-500/20"></div>
                    </div>
                    <div
                        className="absolute bottom-1/4 left-[30%] animate-bounce"
                        style={{ animationDelay: '600ms' }}
                    >
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-40 shadow-sm"></div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="mb-8 sm:mb-10 px-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        Oops! Page Not Found
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-2 font-medium">
                        Looks like this page went over budget and disappeared!
                    </p>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500">
                        The page you&apos;re looking for doesn&apos;t exist, has been moved, or is currently unavailable.
                    </p>
                </div>

                {/* Budget Buddy Branding */}
                <div className="flex items-center justify-center space-x-3 mb-8 sm:mb-10 group select-none">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-full shadow-sm border-2 border-white dark:border-gray-800 bg-white">
                        <Image
                            src="/budgetbuddy-logo.svg"
                            alt="Budget Buddy Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors duration-300 tracking-tight">
                        Budget Buddy
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 px-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-[#ff6b47] text-white px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300 group flex items-center justify-center"
                    >
                        <Home className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        Go Home
                    </Link>

                    {/* Back Button Wrapper to match sizing */}
                    <div className="sm:w-auto">
                        <BackButton />
                    </div>
                </div>

                {/* Fun Message Container */}
                <div className="mx-4 sm:mx-auto max-w-lg mt-2 sm:mt-6 p-4 sm:p-5 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl sm:rounded-full shadow-sm">
                    <p className="text-orange-600 dark:text-orange-400 font-medium text-sm sm:text-base leading-snug">
                        💡 <span className="font-bold">Pro tip:</span> Use Budget Buddy to avoid going over budget on your shopping too!
                    </p>
                </div>
            </div>
        </div>
    );
}
