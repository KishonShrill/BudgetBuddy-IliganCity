import Link from "next/link";

interface SimpleFooterProps {
    className?: string;
}

const SimpleFooter = ({ className = "" }: SimpleFooterProps) => {
    return (
        <footer className={`mt-3 border-t border-gray-200 dark:border-gray-800 p-8 text-center text-sm text-gray-500 dark:text-gray-400 ${className}`}>
            <p>© 2026 Budget Buddy. All rights reserved.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
                {/* Replacing buttons with Links is better for SEO 
                   and removes the need for "use client"
                */}
                <Link
                    href="/privacy-policy"
                    className="font-medium hover:text-orange-500 dark:hover:text-orange-400 hover:underline"
                >
                    Privacy Policy
                </Link>
                <Link
                    href="/terms-of-service"
                    className="font-medium hover:text-orange-500 dark:hover:text-orange-400 hover:underline"
                >
                    Terms of Service
                </Link>
                <Link
                    href="/report"
                    className="font-medium hover:text-orange-500 dark:hover:text-orange-400 hover:underline"
                >
                    Report Missing Data
                </Link>
            </div>
        </footer>
    );
}

export default SimpleFooter;
