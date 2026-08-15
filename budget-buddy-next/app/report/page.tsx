"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Package, Map, Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { ResultAsync } from "neverthrow";
import Cookies from "universal-cookie";
import { useToast } from "@/components/ToastProvider";

// Next.js uses process.env.NEXT_PUBLIC_ for client-side environment variables
const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const BASE_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/reports`
    : `https://iliganproductprice-mauve.vercel.app/api/reports`;

const cookies = new Cookies();

const ReportPage = () => {
    const { addToast } = useToast();
    const router = useRouter();

    const [reportTab, setReportTab] = useState<'product' | 'location'>('product');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [formData, setFormData] = useState({
        name: '',
        url: "",
        notes: '',
        captchaToken: '' as string | null
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUrlError("");

        const isProduct = reportTab === 'product';
        const endpoint = `${BASE_URL}/${isProduct ? 'missing-product' : 'missing-location'}`;

        try {
            const parsedUrl = new URL(formData.url);

            if (reportTab === 'location') {
                const hostname = parsedUrl.hostname.toLowerCase();
                const pathname = parsedUrl.pathname;
                const allowedGoogleMapsHosts = new Set([
                    'google.com',
                    'www.google.com',
                    'maps.google.com',
                    'maps.app.goo.gl',
                    'goo.gl'
                ]);

                const isGoogleMaps =
                    (allowedGoogleMapsHosts.has(hostname) && pathname.includes('/maps')) ||
                    hostname === 'maps.app.goo.gl' ||
                    (hostname === 'goo.gl' && pathname.startsWith('/maps'));

                if (!isGoogleMaps) {
                    setUrlError("Please provide a valid Google Maps URL.");
                    addToast(
                        "Submission Failed",
                        "Location url must go to Google Maps",
                        "destructive"
                    );
                    setIsSubmitting(false);
                    return;
                }
            }
            else if (reportTab === 'product') {
                const hostname = parsedUrl.hostname.toLowerCase();
                const allowedGoogleSearchHosts = new Set(['google.com', 'www.google.com']);
                const isGoogleSearch =
                    allowedGoogleSearchHosts.has(hostname) &&
                    parsedUrl.pathname === '/search';

                if (!isGoogleSearch) {
                    setUrlError("Please provide a valid Google Search URL (e.g., https://www.google.com/search?q=...)");
                    addToast(
                        "Submission Failed",
                        "Product reference url must start with google.com/search",
                        "destructive"
                    );
                    setIsSubmitting(false);
                    return;
                }
            }
        } catch (err) {
            setUrlError("Invalid URL format.");
            addToast(
                "Submission Failed",
                "Invalid URL format",
                "destructive"
            );
            setIsSubmitting(false);
            return;
        }

        const payload = isProduct
            ? {
                productName: formData.name,
                referenceUrl: formData.url,
                notes: formData.notes,
                captchaToken: formData.captchaToken
            }
            : {
                locationName: formData.name,
                mapsUrl: formData.url,
                notes: formData.notes,
                captchaToken: formData.captchaToken
            };

        // Grab token for the user_verify backend middleware
        const token = cookies.get("budgetbuddy_token");
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Execute Neverthrow Pipeline
        ResultAsync.fromPromise(
            axios.post(endpoint, payload, config),
            (error: any) => {
                // Extract error message from backend or fallback to generic
                console.error(`[API] Error submitting ${reportTab}:`, error);
                setIsSubmitting(false);
                return error.response?.data || { message: "Network error occurred while submitting." };
            }
        )
            .map((response) => response.data)
            .match(
                () => {
                    addToast(
                        "Report Submitted",
                        `Thank you! The ${reportTab} "${formData.name}" has been sent for review.`,
                        "success" // Or standard/default depending on your Toast variants
                    );
                    setFormData({ name: '', url: '', notes: '', captchaToken: '' });
                    setIsSubmitting(false);
                },
                (errorData) => {
                    addToast(
                        "Submission Failed",
                        errorData.message,
                        "destructive"
                    );
                    setIsSubmitting(false);
                }
            );
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-3xl flex-col p-4 sm:p-6 lg:p-10 transition-colors duration-300">
            <button
                onClick={() => router.push('/budget-hub')}
                className="mb-6 self-start flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <ArrowLeft size={16} />
                Back to Hub
            </button>

            <div className="w-full rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-10 shadow-sm transition-colors duration-300">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Report Missing Data</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Help us improve Budget Buddy by submitting missing information.</p>
                </div>

                {/* Tab Selection */}
                <div className="mb-8 flex rounded-full bg-gray-100 dark:bg-gray-900 p-1 transition-colors">
                    <button
                        onClick={() => { setReportTab('product'); setFormData({ name: '', url: '', notes: '', captchaToken: formData.captchaToken }); }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-all ${reportTab === 'product' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <Package size={16} /> Product
                    </button>
                    <button
                        onClick={() => { setReportTab('location'); setFormData({ name: '', url: '', notes: '', captchaToken: formData.captchaToken }); }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-all ${reportTab === 'location' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <Map size={16} /> Location
                    </button>
                </div>

                {/* Report Form */}
                <form onSubmit={handleReportSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            {reportTab === 'product' ? 'Product Name' : 'Store/Location Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={reportTab === 'product' ? 'e.g. Magic Flakes 10s' : 'e.g. Savemore - City Center'}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none transition-colors text-gray-900 dark:text-white focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            {reportTab === 'product' ? 'Product Reference URL' : 'Google Maps URL'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder={reportTab === 'product' ? `https://www.google.com/...` : 'https://www.google.com/maps/...'}
                            className={`w-full rounded-xl border bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none transition-colors text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 ${urlError
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-500/20"
                                : "border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-200 dark:focus:ring-orange-500/20"
                                }`}
                            required
                        />

                        {urlError ? (
                            <p className="mt-1 text-xs font-bold text-red-500">{urlError}</p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Please provide a link to verify this {reportTab}.</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Additional Notes <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Any extra details we should know?"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none transition-colors text-gray-900 dark:text-white focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/20"
                        />
                    </div>

                    {process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY && (
                        <div className='flex justify-center'>
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY as string}
                                onChange={(val: any) => { setFormData({ ...formData, captchaToken: val }); }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Report'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportPage;
