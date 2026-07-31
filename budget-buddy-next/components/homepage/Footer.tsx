"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { ResultAsync } from 'neverthrow';

import Github from '@/public/images/icons/github.svg'
import Facebook from '@/public/images/icons/facebook.svg'
import Linkedin from '@/public/images/icons/LI-In-Bug.png'

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;

type Links = {
    name: string;
    href: string;
    disabled?: boolean;
}

const Footer = () => {
    const pathname = usePathname();
    const [systemStatus, setSystemStatus] = useState<'checking' | 'operational' | 'offline'>('checking');

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // If it's a hash link and we're on the homepage
        if (href.startsWith('/#') && pathname === '/') {
            e.preventDefault();
            const id = href.substring(2);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', href);
            }
        }
    };

    useEffect(() => {
        const checkHealth = async () => {
            const DATABASE_URL = DEVELOPMENT
                ? `http://${LOCALHOST}:5000/`
                : "https://iliganproductprice-mauve.vercel.app/";

            const result = await ResultAsync.fromPromise(
                axios.get(DATABASE_URL),
                (error: any) => error
            );

            console.log(result)

            result.match(
                (response) => {
                    if (response.data && response.data.healthy === true) {
                        setSystemStatus('operational');
                    } else {
                        setSystemStatus('offline');
                    }
                },
                (error) => {
                    console.error("System check failed:", error.message);
                    setSystemStatus('offline');
                }
            );
        };

        checkHealth();
    }, []);

    const footerLinks: Record<string, Links[]> = {
        product: [
            { name: 'Features', href: '/#features' },
            { name: 'How It Works', href: '/#how-it-works' },
        ],
        company: [
            { name: 'Developer', href: 'https://chriscent.is-a.dev/' },
        ],
        resources: [
            { name: 'Help Center', href: 'https://github.com/KishonShrill/BudgetBuddy-IliganCity/discussions', disabled: true },
            { name: 'Budgeting Tips', href: '#', disabled: true },
            { name: 'Community', href: '#', disabled: true },
            { name: 'Blog', href: '#', disabled: true }
        ],
        legal: [
            { name: 'Privacy Policy', href: '/privacy-policy' },
            { name: 'Terms of Service', href: '/terms-of-service' },
            { name: 'Report Missing Data', href: '/report' }
        ]
    };

    const socialLinks = [
        { icon: Facebook, href: 'https://www.facebook.com/budgetbuddy.iligan', label: 'Facebook', color: "#0866FF" },
        { icon: Github, href: 'https://github.com/KishonShrill', label: 'GitHub' },
        { icon: Linkedin, href: 'https://ph.linkedin.com/in/chriscent-louis-june-pingol', label: 'LinkedIn' }
    ];

    return (
        <footer className="bg-gray-900 text-white dark:border-t dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid lg:grid-cols-6 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-6 group">
                            <Image src="/budgetbuddy-logo.svg" alt="Logo" width={38} height={38} className='rounded-full' />
                            <span className="text-xl font-bold">Budget Buddy</span>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Empowering smart financial decisions through free, accessible budgeting tools. Join thousands of users who have taken control of their shopping habits.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
                            <Heart className="w-4 h-4 text-[#ee4d2d]" />
                            <span>Made with love as a non-profit initiative</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4 justify-center lg:justify-start">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target='_blank'
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-white transition-colors duration-300 group"
                                    aria-label={social.label}
                                >
                                    <Image
                                        src={social.icon}
                                        alt={social.label}
                                        width={20}
                                        height={20}
                                        unoptimized
                                        className={`group-hover:scale-110 transition-transform duration-300 text-white `}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-4 grid max-sm:grid-cols-2 grid-cols-3 lg:grid-cols-4 gap-8">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category} className='text-center lg:text-left'>
                                <h3 className="font-semibold mb-4 text-white capitalize">{category}</h3>
                                <ul className="space-y-3">
                                    {links.map((link, index) => (
                                        <li key={index}>
                                            <Link
                                                href={link.href}
                                                onClick={(e) => handleScroll(e, link.href)}
                                                className={`text-gray-400 hover:text-[#ee4d2d] transition-colors duration-300 hover:translate-x-1 inline-block ${link.disabled ? 'pointer-events-none text-gray-600' : ''}`}
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsletter Section (Uncomment when ready)
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                            <p className="text-gray-400">
                                Get budgeting tips and product updates delivered to your inbox.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#ee4d2d] transition-colors duration-300"
                                />
                            </div>
                            <button className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div> 
                */}
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-gray-400 text-sm max-md:text-center">
                            <p>© 2026 Budget Buddy. All rights reserved.</p>
                            <p>Built with ❤️ for the community.</p>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end max-md:space-x-3 text-sm text-gray-400">
                            <span className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${systemStatus === 'operational' ? 'bg-green-500' :
                                    systemStatus === 'offline' ? 'bg-red-500' :
                                        'bg-yellow-500 animate-pulse'
                                    }`}></div>
                                {systemStatus === 'operational' && "All systems operational"}
                                {systemStatus === 'offline' && "Systems offline"}
                                {systemStatus === 'checking' && "Checking systems..."}
                            </span>
                            <span>Version 2.2.8</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
