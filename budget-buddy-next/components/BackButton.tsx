'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="z-10 border-2 border-[#ee4d2d] text-[#ee4d2d] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#ee4d2d] hover:text-white transition-all duration-300 hover:scale-105 group flex items-center justify-center"
        >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
        </button>
    );
}
