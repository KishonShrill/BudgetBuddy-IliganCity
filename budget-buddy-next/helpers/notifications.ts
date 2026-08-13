// Define standard Notification options provided by the DOM
// Next.js includes these types automatically via standard TypeScript DOM libs.
export const requestNotificationPermission = async (): Promise<boolean> => {
    // 1. SSR Safety Check: Ensure we are in the browser
    if (typeof window === "undefined" || !("Notification" in window)) {
        // Replaced alert with console.warn to prevent blocking the UI 
        // or causing issues if triggered unexpectedly.
        console.warn("This browser does not support notifications.");
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
    }
};

// 2. We use the built-in NotificationOptions type for strict typing
export const showNotification = (title: string, options: NotificationOptions = {}): void => {
    // SSR Safety Check
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
        new Notification(title, {
            body: options.body || "This is a notification",
            icon: options.icon || "/budgetbuddy-logo.svg", // Updated to your app's logo
            ...options,
        });
    }
};
