import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';
import { Metadata } from 'next';
import BackButton from '@/components/BackButton'; // Adjust path to wherever you saved it

// Native Next.js SEO Metadata
export const metadata: Metadata = {
    title: 'Page not found | Budget Buddy',
    description: 'This site does not exist or has been moved.',
};

export default function NotFound() {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center px-4 overflow-hidden relative min-h-screen">
            <div className="flex flex-col justify-center max-w-2xl mx-auto text-center sm:h-[calc(100vh-76px)] h-[calc(100vh-148px)] z-10">
                {/* Animated 404 */}
                <div className="relative mb-4 sm:mb-8">
                    <div className="text-[8rem] sm:text-[12rem] md:text-[16rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] leading-none animate-pulse">
                        404
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 animate-bounce">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#ee4d2d] to-[#ff6b47] rounded-full opacity-60"></div>
                    </div>
                    <div className="absolute top-1/3 right-1/4 transform -translate-y-1/2 animate-bounce delay-300">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-40"></div>
                    </div>
                    <div className="absolute bottom-1/4 left-1/3 animate-bounce delay-500">
                        <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-50"></div>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Oops! Page Not Found
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-2">
                        Looks like this page went over budget and disappeared!
                    </p>
                    <p className="text-sm sm:text-base text-gray-500">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                {/* Budget Buddy Branding */}
                <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-8 group">
                    <Image
                        src="/budgetbuddy-logo.svg"
                        alt="Budget Buddy Logo"
                        width={64}
                        height={64}
                        className="rounded-full"
                    />
                    <span className="text-xl font-bold text-gray-900 group-hover:text-[#ee4d2d] transition-colors duration-300">
                        Budget Buddy
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4 sm:mb-12">
                    <Link
                        href="/"
                        className="z-10 bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[#ee4d2d]/25 group flex items-center justify-center"
                    >
                        <Home className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                        Go Home
                    </Link>

                    {/* Render the Client Component for interactivity */}
                    <BackButton />
                </div>

                {/* Fun Message */}
                <div className="mt-4 sm:mt-8 p-4 bg-gradient-to-r from-[#ee4d2d]/10 to-orange-100 rounded-full">
                    <p className="text-[#ee4d2d] font-medium">
                        💡 Pro tip: Use Budget Buddy to avoid going over budget on your shopping too!
                    </p>
                </div>
            </div>

            {/* Background Elements */}
            <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#ee4d2d]/10 to-orange-200/10 rounded-full blur-3xl animate-pulse pointer-events-none -z-10"></div>
            <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-orange-200/10 to-[#ee4d2d]/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none -z-10"></div>
        </div>
    );
}
