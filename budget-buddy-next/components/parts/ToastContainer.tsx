"use client";

import * as Toast from "@radix-ui/react-toast"; // Standard Radix import
import { CheckCircle, X, XCircle, AlertTriangle, Info } from "lucide-react";

// 1. Define the exact shape of your Toast object
export interface ToastMessage {
    id: number;
    name: string;
    description?: string | null;
    type: string;
    open: boolean;
}

// 2. Define the Props for the Container
interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

// Helper to determine the correct icon and color based on the toast type
const getToastStyles = (type: string) => {
    switch (type) {
        case 'destructive':
        case 'error':
            return {
                icon: <XCircle size={20} />,
                colorClass: 'bg-red-100 text-red-500',
            };
        case 'warning':
            return {
                icon: <AlertTriangle size={20} />,
                colorClass: 'bg-yellow-100 text-yellow-600',
            };
        case 'default':
        case 'info':
            return {
                icon: <Info size={20} />,
                colorClass: 'bg-blue-100 text-blue-500',
            };
        case 'success':
        default:
            return {
                icon: <CheckCircle size={20} />,
                colorClass: 'bg-green-100 text-green-500',
            };
    }
};

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <Toast.Provider swipeDirection="right" duration={3000}>
            {toasts.map(toast => {
                // Get the dynamic styles for this specific toast
                const { icon, colorClass } = getToastStyles(toast.type);

                return (
                    <Toast.Root
                        key={toast.id}
                        className="ToastRoot pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-black/5"
                        open={toast.open}
                        onOpenChange={(open) => {
                            if (!open) removeToast(toast.id);
                        }}
                    >
                        {/* Dynamic Icon & Color */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                            {icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <Toast.Title className="text-sm font-semibold text-gray-900 truncate">
                                {toast.name}
                            </Toast.Title>
                            <Toast.Description className="text-xs text-gray-500">
                                {toast?.description ? toast.description : 'Added to your cart'}
                            </Toast.Description>
                        </div>
                        <Toast.Action asChild altText="Close notification">
                            <button className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                                <X size={16} />
                            </button>
                        </Toast.Action>
                    </Toast.Root>
                );
            })}

            <Toast.Viewport className="ToastViewport fixed z-[100] flex gap-3 w-full top-0 left-0 right-0 sm:top-4 lg:top-auto lg:bottom-0 flex-col lg:flex-col-reverse items-center sm:max-w-sm sm:left-1/2 sm:-translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-0 lg:items-end lg:p-6 outline-none pointer-events-none" />
        </Toast.Provider>
    );
}
