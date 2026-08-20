"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, TrendingUp, Shield, ExternalLink, Check, Share2, X, Copy, ChevronDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Cookies from 'js-cookie';
import Facebook from '@/public/images/icons/facebook.svg'

const MockupContent = () => (
    <>
        <div className="bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] rounded-2xl p-6 mb-3 md:mb-6 shadow-md shrink-0">
            <div className="flex items-center justify-between text-white mb-4">
                <h3 className="text-lg font-semibold">Shopping Cart</h3>
                <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-white">₱127.50</div>
            <div className="text-orange-100 text-sm">Budget: ₱150.00</div>
        </div>

        <div className="space-y-2 md:space-y-4 shrink-0">
            {[
                { name: 'Catsan Light Cat Litter 3L', price: '₱159.8' },
                { name: 'Slurpee Large', price: '₱40' },
                { name: 'Ottogi Cheese Ramen Pouch 111g', price: '₱89' },
                { name: 'Century Tuna Flakes in Oil 180g', price: '₱52' }
            ].map((item, index) => (
                <div key={index} className="flex gap-2 justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 border border-transparent dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-200 text-sm">{item.name}</span>
                    <span className="font-semibold text-[#ee4d2d] dark:text-orange-400">{item.price}</span>
                </div>
            ))}
        </div>

        <div className="mt-3 md:mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg shrink-0">
            <div className="text-green-800 dark:text-green-400 font-medium">✓ Under Budget!</div>
            <div className="text-green-600 dark:text-green-500 text-sm">You have ₱22.50 remaining</div>
        </div>
    </>
);

const Hero = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const appUrl = "https://productprice-iligan.vercel.app/";
    const shareMessage = "Check out Budget Buddy! It's a smart shopping tool to track and compare grocery prices in Iligan City. 🛒📉";

    useEffect(() => {
        setToken(Cookies.get("budgetbuddy_token") as string);
    }, [token])

    const handleCopyLink = () => {
        navigator.clipboard.writeText(appUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`, '_blank');
    };

    const shareToTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareMessage)}`, '_blank');
    };

    return (
        <section className="relative lg:h-[calc(100dvh-62px)] flex items-center pt-12 pb-16 bg-orange-50 dark:bg-gray-900 overflow-visible transition-colors duration-300">
            <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 max-md:gap-6 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        {/* FIX 2: Softened the badge background and text for dark mode */}
                        <div className="select-none inline-flex items-center bg-linear-to-r from-[#ee4d2d]/10 to-orange-100 dark:from-[#ee4d2d]/20 dark:to-orange-900/30 px-4 py-2 rounded-full text-[#ee4d2d] dark:text-orange-400 font-medium text-sm mb-6 hover:scale-105 transition-transform duration-300">
                            <Shield className="w-4 h-4 mr-2" />
                            100% Free • Non-Profit Initiative
                        </div>

                        <h1 className="flex flex-wrap justify-center lg:justify-start gap-x-2 font-black text-shadow-xl text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-gray-50 mb-6 leading-none">
                            Shop Smarter,
                            <span className="font-black text-transparent bg-clip-text bg-linear-to-r from-[#ee4d2d] to-[#ff6b47]">
                                Spend Less
                            </span>
                        </h1>

                        <p className="text-lg max-md:text-base text-gray-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                            Track your shopping cart total in real-time before checkout. Budget Buddy helps you make informed decisions and stick to your budget effortlessly.
                        </p>

                        <div className="flex flex-col max-sm:grid max-sm:grid-cols-2 max-md:px-4 sm:flex-row gap-4 items-center justify-center lg:justify-start">
                            <Link href={token ? `/budget-hub` : `/locations`} className="col-span-2 flex items-center max-lg:justify-center lg:w-fit bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-8 py-4 max-md:py-3 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[#ee4d2d]/25 group">
                                Start Budgeting
                                <ShoppingCart className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>

                            <a href="https://github.com/KishonShrill/BudgetBuddy-IliganCity" target='_blank' rel="noopener noreferrer" className="flex items-center max-lg:justify-center lg:w-fit border-2 border-[#ee4d2d] text-[#ee4d2d] dark:text-orange-400 dark:border-orange-400 px-8 py-4 max-md:py-3 rounded-full font-semibold text-lg hover:bg-[#ee4d2d] dark:hover:bg-orange-500 hover:text-white dark:hover:text-gray-900 transition-all duration-300 hover:scale-105 group">
                                Github
                                <ExternalLink className='w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300' />
                            </a>

                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="cursor-pointer flex items-center max-lg:justify-center lg:w-fit border-2 border-gray-300 text-gray-600 dark:border-gray-500 dark:text-gray-300 px-6 py-4 max-md:py-3 rounded-full font-semibold text-lg hover:border-[#ee4d2d] hover:text-[#ee4d2d] dark:hover:border-[#ee4d2d] dark:hover:text-[#ee4d2d] transition-all duration-300 hover:scale-105"
                            >
                                Share
                                <Share2 className='w-5 h-5 ml-2 inline' />
                            </button>

                        </div>

                        {/* Stats */}
                        {/* <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                            {[
                                { number: '50K+', label: 'Happy Users' },
                                { number: '₱2M+', label: 'Money Saved' },
                                { number: '4.9★', label: 'User Rating' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center group cursor-pointer">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#ee4d2d] dark:group-hover:text-orange-400 transition-colors duration-300">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div> */}
                    </div>

                    {/* Right Content - Stacked Cards Effect */}
                    <div className="relative w-full max-w-[500px] mx-auto max-md:px-4 group z-10 perspective-1000">

                        {/* Background Glowing Orbs */}
                        <div className="absolute -top-4 -right-4 w-72 h-72 bg-linear-to-br from-[#ee4d2d]/20 to-orange-200/20 dark:from-[#ee4d2d]/10 dark:to-orange-900/10 rounded-full blur-3xl -z-20 pointer-events-none"></div>
                        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-linear-to-br from-orange-200/20 to-[#ee4d2d]/20 dark:from-orange-900/10 dark:to-[#ee4d2d]/10 rounded-full blur-3xl -z-20 pointer-events-none"></div>

                        {/* LEFT Tilted Decorative Card */}
                        <div className="absolute inset-0 -z-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 rounded-3xl shadow-xl transform -rotate-6 -translate-x-4 sm:-translate-x-8 translate-y-6 scale-95 opacity-60 dark:opacity-40 transition-all duration-500 group-hover:-translate-x-8 sm:group-hover:-translate-x-30 group-hover:-rotate-20 group-hover:opacity-80 p-8 max-md:p-4 pointer-events-none overflow-hidden flex flex-col">
                            <MockupContent />
                        </div>

                        {/* RIGHT Tilted Decorative Card */}
                        <div className="absolute inset-0 -z-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 rounded-3xl shadow-xl transform rotate-6 translate-x-4 sm:translate-x-8 translate-y-4 scale-95 opacity-60 dark:opacity-40 transition-all duration-500 group-hover:translate-x-8 sm:group-hover:translate-x-30 group-hover:rotate-20 group-hover:opacity-80 p-8 max-md:p-4 pointer-events-none overflow-hidden flex flex-col">
                            <MockupContent />
                        </div>

                        {/* MAIN Front Card */}
                        <div className="select-none relative z-10 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-3xl shadow-2xl p-8 max-md:p-4 transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl flex flex-col">
                            <MockupContent />
                        </div>

                    </div>
                </div>
            </div>

            {isShareModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsShareModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative transform transition-all scale-100"
                        onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing modal
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsShareModalOpen(false)}
                            className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6 mt-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Budget Buddy</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Scan the QR code or share the link below!</p>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                                <QRCodeSVG
                                    value={appUrl}
                                    size={180}
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"Q"}
                                />
                            </div>
                        </div>

                        {/* Link Copy Box */}
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-6 border border-gray-200 dark:border-gray-600">
                            <input
                                type="text"
                                readOnly
                                value={appUrl}
                                className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none px-2 truncate"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="cursor-pointer flex items-center justify-center bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600 dark:text-gray-200" />}
                            </button>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={shareToFacebook}
                                className="cursor-pointer flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg font-medium transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Facebook
                            </button>
                            <button
                                onClick={shareToTwitter}
                                className="cursor-pointer flex items-center justify-center gap-2 py-2.5 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white rounded-lg font-medium transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Twitter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                onClick={() => window.scrollBy({ top: window.innerHeight * 0.95, behavior: 'smooth' })}
                className="absolute min-w-30 max-lg:hidden bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce text-[#ee4d2d] dark:text-orange-400 transition-colors cursor-pointer z-20 group"
            >
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 select-none">
                    Scroll
                </span>
                <ChevronDown className="w-6 h-6" />
            </div>
        </section>
    );
};

export default Hero;
