import Link from 'next/link';
import { Plus, Calculator, CheckCircle, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: Plus,
            link: '/locations',
            title: 'Add Products',
            description: 'Simply add items to your Budget Buddy cart as you browse online stores.',
            details: 'Copy and paste product names and prices, or use our browser extension for automatic detection.'
        },
        {
            icon: Calculator,
            link: '/receipt',
            title: 'Track Your Total',
            description: 'Watch your running total update in real-time with tax and shipping estimates.',
            details: 'Set your budget limit and get visual indicators when you\'re approaching your spending goal.'
        },
        {
            icon: CheckCircle,
            title: 'Shop Confidently',
            description: 'Make informed decisions and checkout knowing exactly what you\'ll spend.',
            details: 'Get alerts if you go over budget and suggestions for staying within your limits.'
        }
    ];

    return (
        <section id="how-it-works" className="snap-start py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Demo Section */}
                <div className="bg-linear-to-br from-[#ee4d2d]/5 to-orange-50 dark:from-gray-800/80 dark:to-gray-800/40 rounded-3xl p-8 md:p-12 border border-transparent dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            See It In Action
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Watch how Budget Buddy helps you stay on track with your shopping goals in real-time.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Demo Interface */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-transparent dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Shopping Cart</h4>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Budget: ₱200</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {[
                                    { item: 'Lettuce', price: 45.99 },
                                    { item: 'Ginger', price: 19.99 },
                                    { item: 'Eggplant', price: 34.99 }
                                ].map((product, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg select-none transition-colors duration-300 border border-transparent dark:border-gray-600/50">
                                        <span className="text-gray-700 dark:text-gray-200">{product.item}</span>
                                        <span className="font-semibold text-[#ee4d2d] dark:text-orange-400">₱{product.price}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                                    <span className="text-2xl font-bold text-[#ee4d2d] dark:text-orange-400">₱100.97</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] h-2 rounded-full" style={{ width: '50.5%' }}></div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">₱99.03 remaining in budget</div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-6">
                            {[
                                { title: 'Never Overspend Again', desc: 'Always have a transparent look of your spending' },
                                { title: 'Online Browsing', desc: 'Browse all options without stepping out of your house' },
                                { title: 'Multiple Store Support', desc: 'Works with all major online retailers' }
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex items-start space-x-4 group cursor-default">
                                    <div className="w-6 h-6 bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 dark:text-gray-200 group-hover:text-[#ee4d2d] dark:group-hover:text-orange-400 transition-colors duration-300">
                                            {benefit.title}
                                        </h5>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-10 mb-4">
                        <Link href="/locations" className="inline-block bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[#ee4d2d]/25 dark:hover:shadow-orange-900/50">
                            Try Budget Buddy Now
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
