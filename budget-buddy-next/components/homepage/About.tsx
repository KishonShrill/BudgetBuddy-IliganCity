import { Heart, Target, Globe, Award } from 'lucide-react';

const About = () => {
    const values = [
        {
            icon: Heart,
            title: 'Community First',
            description: 'Built by the community, for the community. Every feature is designed with user feedback and real needs in mind.'
        },
        {
            icon: Target,
            title: 'Mission Driven',
            description: 'Our goal is simple: help people make better financial decisions and reduce unnecessary spending.'
        },
        {
            icon: Globe,
            title: 'Accessible to All',
            description: 'Completely free and accessible worldwide. No premium features, no hidden costs, just helpful tools.'
        },
        {
            icon: Award,
            title: 'Trusted Solution',
            description: 'Thousands of users trust Budget Buddy to help them stay within their shopping budgets every day.'
        }
    ];

    return (
        < section id="about" className="py-20 bg-linear-to-br from-gray-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300" >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 max-md:gap-6 items-center">
                    {/* Left Content */}
                    <div>
                        {/* FIX 2: Matched the badge contrast with the Hero section */}
                        <div className="inline-flex items-center bg-linear-to-r from-[#ee4d2d]/10 to-orange-100 dark:from-[#ee4d2d]/20 dark:to-orange-900/30 px-4 py-2 rounded-full text-[#ee4d2d] dark:text-orange-400 font-medium text-sm mb-6">
                            <Heart className="w-4 h-4 mr-2" />
                            Non-Profit Initiative
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Empowering Smart{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#ee4d2d] to-[#ff6b47]">
                                Financial Decisions
                            </span>
                        </h2>

                        <p className="text-lg max-md:text-base text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            Budget Buddy was born from a simple observation: too many people overspend while shopping online because they lose track of their cart total. We created a free, easy-to-use tool that helps you stay aware of your spending in real-time.
                        </p>

                        <p className="text-lg max-md:text-base text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            As a non-profit initiative, we&apos;re committed to keeping Budget Buddy completely free and accessible to everyone. Our mission is to promote financial wellness and help people make more informed purchasing decisions.
                        </p>

                        {/* FIX 3: Added dark mode backgrounds and borders to the feature pills */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 px-4 py-2 rounded-full shadow-sm">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">100% Free Forever</span>
                            </div>
                            <div className="flex items-center bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 px-4 py-2 rounded-full shadow-sm">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy Focused</span>
                            </div>
                            <div className="flex items-center bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 px-4 py-2 rounded-full shadow-sm">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Open Source</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Values Grid */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-transparent dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl hover:border-[#ee4d2d]/20 dark:hover:border-[#ee4d2d]/40 transition-all duration-300 hover:-translate-y-1 group select-none"
                            >
                                <div className='max-sm:flex max-sm:gap-4 max-sm:mb-2'>
                                    <div className={`w-12 h-12 max-sm:my-auto bg-linear-to-br from-[#ee4d2d] to-[#ff6b47] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                                        <value.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="max-sm:h-fit max-sm:my-auto text-lg font-bold text-gray-900 dark:text-white sm:mb-2 group-hover:text-[#ee4d2d] dark:group-hover:text-orange-400 transition-colors duration-300">
                                        {value.title}
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Section (Uncomment when ready to display impact) */}
                {/* <div className="mt-20 bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg border border-transparent dark:border-gray-700">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Making a Real Impact
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            See how Budget Buddy is helping people around the world make better financial decisions every day.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { number: '50,000+', label: 'Active Users', sublabel: 'Growing daily' },
                            { number: '₱2.1M', label: 'Money Saved', sublabel: 'By our community' },
                            { number: '95%', label: 'Success Rate', sublabel: 'Stay under budget' },
                            { number: '4.9/5', label: 'User Rating', sublabel: 'App store reviews' }
                        ].map((stat, index) => (
                            <div key={index} className="text-center group">
                                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#ee4d2d] to-[#ff6b47] mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {stat.number}
                                </div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{stat.label}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.sublabel}</div>
                            </div>
                        ))}
                    </div>
                </div> 
                */}
            </div>
        </section >
    );
};

export default About;
