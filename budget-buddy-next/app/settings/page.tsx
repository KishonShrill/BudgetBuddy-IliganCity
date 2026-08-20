"use client";

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as Separator from '@radix-ui/react-separator';
import * as Select from '@radix-ui/react-select';
import * as Switch from '@radix-ui/react-switch';
import {
    Settings as SettingsIcon, Moon, Sun, Bell,
    Volume2, Palette, Zap, RotateCcw, X,
    ChevronDown, Check, ArrowLeft,
} from 'lucide-react';
import useSettings from '@/hooks/useSettings';

const Settings = () => {
    const router = useRouter();
    const { settings, updateSetting, resetSettings } = useSettings();
    const { theme, setTheme } = useTheme();
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    const goBack = () => {
        router.back();
    }

    const handleReset = () => {
        resetSettings();
        setIsResetDialogOpen(false);
    };

    // Types for the category mapping
    interface SettingCategory {
        title: string;
        icon: React.ElementType;
        items: {
            title: string;
            description: string;
            icon: React.ElementType;
            control: React.ReactNode;
        }[];
    }


    const settingCategories: SettingCategory[] = [
        {
            title: "Appearance",
            icon: Palette,
            items: [
                {
                    title: "Theme (Beta)",
                    description: "Switch between light and dark mode",
                    icon: theme === 'dark' ? Moon : Sun,
                    control: (
                        <CustomSwitch
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        />
                    )
                },
                /*
                {
                    title: "Right-to-Left (RTL)",
                    description: "Enable RTL layout for Arabic, Hebrew, and other RTL languages",
                    icon: Globe,
                    control: (
                        <CustomSwitch
                            checked={settings.rightToLeft}
                            onCheckedChange={(checked) => updateSetting('rightToLeft', checked)}
                        />
                    )
                },
                */
                {
                    title: "Compact Mode",
                    description: "Use a more compact layout by hiding the photos to fit more content",
                    icon: Zap,
                    control: (
                        <CustomSwitch
                            checked={settings.hidePhotos}
                            onCheckedChange={(checked) => updateSetting('hidePhotos', checked)}
                        />
                    )
                }
            ]
        },
        {
            title: "Notifications",
            icon: Bell,
            items: [
                /*
                {
                    title: "Push Notifications",
                    description: "Receive notifications about budget alerts and updates",
                    icon: Bell,
                    control: (
                        <CustomSwitch
                            checked={settings.notifications}
                            onCheckedChange={(checked) => updateSetting('notifications', checked)}
                        />
                    )
                },
                {
                    title: "Budget Alerts",
                    description: "Get notified when approaching your budget limit",
                    icon: DollarSign,
                    control: (
                        <CustomSwitch
                            checked={settings.budgetAlerts}
                            onCheckedChange={(checked) => updateSetting('budgetAlerts', checked)}
                            disabled={!settings.notifications}
                        />
                    )
                },
                */
                {
                    title: "Sound Effects",
                    description: "Play sounds for notifications and interactions",
                    icon: Volume2,
                    control: (
                        <CustomSwitch
                            checked={settings.soundEffects}
                            onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                        />
                    )
                }
            ]
        },
        /*
        {
            title: "Preferences",
            icon: SettingsIcon,
            items: [
                {
                    title: "Auto Save",
                    description: "Automatically save your budget data as you make changes",
                    icon: Save, 
                    control: (
                        <CustomSwitch
                            checked={settings.autoSave}
                            onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                        />
                    )
                },
                {
                    title: "Currency",
                    description: "Choose your preferred currency for displaying prices",
                    icon: DollarSign,
                    control: (
                        <CustomSelect
                            value={settings.currency}
                            onValueChange={(value) => updateSetting('currency', value)}
                            options={currencyOptions} 
                            placeholder="Select currency"
                        />
                    )
                },
                {
                    title: "Language",
                    description: "Select your preferred language",
                    icon: Globe,
                    control: (
                        <CustomSelect
                            value={settings.language}
                            onValueChange={(value) => updateSetting('language', value)}
                            options={languageOptions} 
                            placeholder="Select language"
                        />
                    )
                }
            ]
        }
        */
    ];

    return (
        <div className="hide-mobile-scrollbar overflow-y-auto min-h-[calc(100dvh-65px)] bg-linear-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-8 max-md:pb-[6.5rem]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-linear-to-br from-[#ee4d2d] to-[#ff6b47] rounded-xl flex items-center justify-center">
                            <SettingsIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                            <p className="text-gray-600 dark:text-gray-400">Customize your Budget Buddy experience</p>
                        </div>
                    </div>
                    <button className='w-12 h-12 mb-4 rounded-xl grid place-items-center bg-orange-600 dark:bg-gray-800 dark:border dark:border-gray-700 hover:scale-105 transition-transform' onClick={goBack}>
                        <ArrowLeft className='w-6 h-6 dark:text-orange-600 text-white' />
                    </button>
                </div>

                <div className="space-y-8">
                    {settingCategories.map((category) => (
                        <React.Fragment key={category.title}>
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <category.icon className="w-5 h-5 mr-2 text-[#ee4d2d]" />
                                    {category.title}
                                </h2>
                                <div className="space-y-4">
                                    {category.items.map((item) => (
                                        <SettingItem
                                            key={item.title}
                                            icon={item.icon}
                                            title={item.title}
                                            description={item.description}
                                        >
                                            {item.control}
                                        </SettingItem>
                                    ))}
                                </div>
                            </section>

                            <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700" />
                        </React.Fragment>
                    ))}

                    {/* Reset Section */}
                    <section>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                                        Reset Settings
                                    </h3>
                                    <p className="text-red-700 dark:text-red-300 pr-4 max-w-lg">
                                        This will restore all settings to their default values. This action cannot be undone.
                                    </p>
                                </div>
                                <Dialog.Root open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                                    <Dialog.Trigger asChild>
                                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-300 hover:scale-105 transform flex items-center space-x-2">
                                            <RotateCcw className="w-4 h-4" />
                                            <span>Reset All</span>
                                        </button>
                                    </Dialog.Trigger>

                                    <Dialog.Portal>
                                        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-50 animate-in fade-in" />
                                        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-[90%] z-50 animate-in zoom-in-95 duration-200">
                                            <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                Reset All Settings?
                                            </Dialog.Title>
                                            <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
                                                This will restore all settings to their default values. This action cannot be undone.
                                            </Dialog.Description>

                                            <div className="flex space-x-3 justify-end">
                                                <Dialog.Close asChild>
                                                    <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 font-medium">
                                                        Cancel
                                                    </button>
                                                </Dialog.Close>
                                                <button
                                                    onClick={handleReset}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                                                >
                                                    Reset Settings
                                                </button>
                                            </div>

                                            <Dialog.Close asChild>
                                                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </Dialog.Close>
                                        </Dialog.Content>
                                    </Dialog.Portal>
                                </Dialog.Root>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Sub-components with TypeScript interfaces
interface SettingItemProps {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
}

const SettingItem = ({ icon: Icon, title, description, children, className = "" }: SettingItemProps) => (
    <div className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#ee4d2d]/20 dark:hover:border-[#ee4d2d]/30 transition-all duration-300 hover:shadow-md group ${className}`}>
        <div className="flex items-center space-x-4 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ee4d2d] to-[#ff6b47] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#ee4d2d] dark:group-hover:text-[#ff6b47] transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                </p>
            </div>
        </div>
        <div className="ml-4">
            {children}
        </div>
    </div>
);

interface CustomSwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}

const CustomSwitch = ({ checked, onCheckedChange, disabled = false }: CustomSwitchProps) => (
    <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#ee4d2d] data-[state=checked]:to-[#ff6b47] outline-none cursor-pointer transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
    </Switch.Root>
);

interface CustomSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}

const CustomSelect = ({ value, onValueChange, options, placeholder }: CustomSelectProps) => (
    <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger className="inline-flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:border-[#ee4d2d]/50 focus:border-[#ee4d2d] focus:outline-none transition-colors duration-300 min-w-[120px]">
            <Select.Value placeholder={placeholder} />
            <Select.Icon>
                <ChevronDown className="w-4 h-4" />
            </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
            <Select.Content className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                <Select.Viewport className="p-1">
                    {options.map((option) => (
                        <Select.Item
                            key={option.value}
                            value={option.value}
                            className="relative flex items-center px-8 py-2 text-sm text-gray-900 dark:text-white rounded-md cursor-pointer hover:bg-[#ee4d2d]/10 dark:hover:bg-[#ee4d2d]/20 focus:bg-[#ee4d2d]/10 dark:focus:bg-[#ee4d2d]/20 outline-none transition-colors duration-200"
                        >
                            <Select.ItemText>{option.label}</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-2 w-4 h-4">
                                <Check className="w-4 h-4 text-[#ee4d2d]" />
                            </Select.ItemIndicator>
                        </Select.Item>
                    ))}
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>
);

export default Settings;
