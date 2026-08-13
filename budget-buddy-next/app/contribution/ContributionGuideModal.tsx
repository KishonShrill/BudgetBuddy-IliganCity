"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Award, ShieldAlert, ChevronRight, ChevronLeft, CheckCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const guideSteps = [
    {
        id: 'intro',
        icon: BookOpen,
        title: "Welcome to Community Contributions",
        description: "Budget Buddy relies on smart shoppers like you! By contributing updated prices and new products, you help everyone in Iligan City shop smarter and save money.",
        color: "text-blue-500 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
        id: 'ranks',
        icon: Award,
        title: "Points & Ranking System",
        description: "Every approved contribution earns you points! \n\n• +5 points for a new product\n• +2 points for a price update\n\nRank up from 'Smart Shopper' to 'Budget Master' as you help the community.",
        color: "text-orange-500 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
        id: 'rules',
        icon: ShieldAlert,
        title: "Rules & Requirements",
        description: "To prevent spam, your account must be at least 1 week old to submit prices. All submissions go to the 'Pending Hub' where other users will verify them. If your submission gets too many downvotes, it will be rejected.",
        color: "text-red-500 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30"
    }
];

interface ContributionGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContributionGuideModal({ isOpen, onClose }: ContributionGuideProps) {
    const [currentStep, setCurrentStep] = useState(0);

    // Reset to step 1 every time the modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFinish = () => {
        localStorage.setItem('budgetbuddy_hasSeenGuide', 'true');
        onClose();
    };

    const nextStep = () => {
        if (currentStep < guideSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const stepData = guideSteps[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
                <div className='bg-orange-500/20 blur-[100px] w-3/4 h-3/4 rounded-full'></div>
            </div>

            <Card className="w-full max-w-lg shadow-2xl border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 relative transform transition-all scale-100">
                {/* Close Button */}
                <button
                    onClick={handleFinish}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <CardContent className="px-8 max-md:px-6 flex flex-col items-center text-center">
                    {/* Step Indicator */}
                    <div className="flex gap-2 mb-8 mt-2">
                        {guideSteps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 w-12 rounded-full transition-colors duration-300 ${idx <= currentStep ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className={`w-20 h-20 ${stepData.bgColor} rounded-full flex items-center justify-center mb-6`}>
                        <stepData.icon className={`w-10 h-10 ${stepData.color}`} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{stepData.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed min-h-[100px]">
                        {stepData.description}
                    </p>

                    {/* Footer Controls */}
                    <div className="flex w-full justify-between mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''} dark:text-gray-300 dark:hover:bg-gray-700`}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        <Button
                            onClick={nextStep}
                            className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                        >
                            {currentStep === guideSteps.length - 1 ? (
                                <span className="flex items-center">Start Contributing <CheckCircle className="w-4 h-4 ml-2" /></span>
                            ) : (
                                <span className="flex items-center">Next <ChevronRight className="w-4 h-4 ml-2" /></span>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
