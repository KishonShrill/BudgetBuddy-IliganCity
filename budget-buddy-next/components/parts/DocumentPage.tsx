import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface DocumentPageProps {
    title: string;
    content: string;
}

export default function DocumentPage({ title, content }: DocumentPageProps) {
    return (
        <div className="mx-auto max-w-4xl p-6 max-md:px-2 py-2 lg:p-10 relative min-h-screen transition-colors duration-300">
            <style>{`
                /* Base Styles */
                .markdown-body h2 { font-size: 1.5rem; font-weight: 800; color: #1f2937; margin-top: 2rem; margin-bottom: 0.75rem; }
                .markdown-body h2:first-child { margin-top: 0; }
                .markdown-body h3 { font-size: 1.25rem; font-weight: 700; color: #374151; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .markdown-body p { margin-bottom: 1.25rem; line-height: 1.7; color: #374151; }
                .markdown-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; color: #374151; }
                .markdown-body li { margin-bottom: 0.5rem; line-height: 1.6; }
                .markdown-body a { color: #f97316; text-decoration: none; font-weight: 600; transition: color 0.2s; }
                .markdown-body a:hover { color: #ea580c; text-decoration: underline; }
                .markdown-body strong { font-weight: 700; color: #111827; }
                .markdown-body hr { margin: 2rem 0; border: none; border-top: 1px solid #f3f4f6; }
                .markdown-body blockquote { background: #fff7ed; border-left: 4px solid #f97316; padding: 1rem 1.5rem; border-radius: 0 0.5rem 0.5rem 0; margin-bottom: 2rem; color: #c2410c; }
                .markdown-body blockquote p { margin-bottom: 0; }

                /* Dark Mode Overrides */
                .dark .markdown-body h2 { color: #f9fafb; }
                .dark .markdown-body h3 { color: #e5e7eb; }
                .dark .markdown-body p { color: #d1d5db; }
                .dark .markdown-body ul { color: #d1d5db; }
                .dark .markdown-body strong { color: #f9fafb; }
                .dark .markdown-body hr { border-top: 1px solid #374151; }
                .dark .markdown-body blockquote { background: rgba(234, 88, 12, 0.1); border-left: 4px solid #ea580c; color: #fdba74; }

                /* Mobile Adjustments */
                @media (max-width: 768px) {
                    .markdown-body h2 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                    .markdown-body h3 { font-size: 1.125rem; margin-top: 1.25rem; }
                    .markdown-body p { font-size: 0.95rem; margin-bottom: 1rem; line-height: 1.6; }
                    .markdown-body ul { padding-left: 1.25rem; margin-bottom: 1rem; }
                    .markdown-body li { font-size: 0.95rem; margin-bottom: 0.375rem; }
                    .markdown-body blockquote { padding: 0.875rem 1rem; margin-bottom: 1.5rem; }
                }
            `}</style>

            {/* Sticky Back Button using next/link instead of useNavigate */}
            <div className="sticky top-2 md:top-4 right-0 z-10 mb-6 max-md:mb-2 flex justify-end">
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:-translate-y-0.5"
                >
                    <ArrowLeft size={16} />
                    Back to App
                </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm max-md:mb-[6rem] transition-colors duration-300">
                <div className="bg-linear-to-r from-orange-500 to-orange-600 px-6 py-8 text-white sm:px-10">
                    <h1 className="text-3xl font-black">{title}</h1>
                    <p className="mt-2 text-orange-100 text-sm font-medium flex items-center gap-1.5">
                        <Clock size={14} />
                        Last Updated: April 2026
                    </p>
                </div>

                <div className="markdown-body p-6 sm:p-10">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
