import Link from 'next/link';
import { Calculator, Bell, BarChart3, Smartphone, Clock, Users } from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: Calculator,
            title: 'Real-Time Calculations',
            description: 'See your total update instantly as you add items to your cart. No surprises at checkout.',
            color: 'from-[#ee4d2d] to-[#ff6b47]'
        },
        {
            icon: Bell,
            title: 'Budget Alerts',
            description: 'Get notified when you\'re approaching your budget limit with smart, helpful warnings.',
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: BarChart3,
            title: 'Spending Analytics',
            description: 'Track your spending patterns and discover insights to make better financial decisions.',
            color: 'from-red-500 to-pink-500'
        },
        {
            icon: Smartphone,
            title: 'Mobile Friendly',
            description: 'Use Budget Buddy on any device. Perfect for shopping on-the-go or at home.',
            color: 'from-[#ee4d2d] to-orange-500'
        },
        {
            icon: Clock,
            title: 'Quick Setup',
            description: 'Start budgeting in seconds. No complex setup or lengthy registration process required.',
            color: 'from-orange-600 to-red-600'
        },
        {
            icon: Users,
            title: 'Family Sharing',
            description: 'Share budgets with family members and coordinate household spending together.',
            color: 'from-red-600 to-[#ee4d2d]'
        }
    ];

    return (
        < section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300" >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 max-md:mb-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Powerful Features for{' '}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#ee4d2d] to-[#ff6b47]">
                            Smart Shopping
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Everything you need to take control of your shopping budget and make informed purchasing decisions.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="select-none grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="max-sm:h-fit shadow-lg group p-8 max-sm:p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#ee4d2d]/20 dark:hover:border-[#ee4d2d]/40 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                            <div className='max-sm:flex max-sm:gap-4 max-sm:mb-2'>
                                {/* Icon */}
                                <div className={`w-16 h-16 max-sm:w-14 max-sm:h-14 max-sm:my-auto bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="max-sm:h-fit max-sm:my-auto text-xl font-bold text-gray-900 dark:text-white sm:mb-3 group-hover:text-[#ee4d2d] dark:group-hover:text-orange-400 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="font-medium text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16 max-md:mt-8">
                    {/* FIX 3: Softened the CTA pill background and text for dark mode (matching the Hero badge) */}
                    <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-linear-to-r from-[#ee4d2d]/10 to-orange-100 dark:from-[#ee4d2d]/20 dark:to-orange-900/30 px-6 py-3 rounded-full border border-transparent dark:border-orange-900/50">
                        <span className="text-[#ee4d2d] dark:text-orange-400 font-medium max-md:text-sm select-none">
                            Ready to start saving money?
                        </span>
                        <Link href="/locations" className="bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-6 py-2 rounded-full font-semibold max-md:text-sm hover:shadow-lg hover:scale-105 transition-all duration-300">
                            Try Budget Buddy
                        </Link>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default Features;
