"use client";

import { useState } from "react";
import { saveSettings, defaultSettings, type AppSettings } from "@/helpers/settings";
import { requestNotificationPermission, showNotification } from "@/helpers/notifications";

export default function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings as AppSettings);

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        switch (key) {
            case 'notifications': {
                if (value === true) {
                    requestNotificationPermission().then((granted) => {
                        if (granted) {
                            showNotification("Hello 👋", {
                                body: "This came from your Budget Buddy app!",
                                icon: "https://cdn-icons-png.flaticon.com/512/1827/1827370.png",
                            });
                        } else {
                            const reverted = { ...settings, notifications: false };
                            setSettings(reverted);
                            saveSettings(reverted);
                        }
                    });
                }
                break;
            }
        }

        const updated = { ...settings, [key]: value };
        setSettings(updated);
        saveSettings(updated);
    };

    const toggleSetting = (key: keyof AppSettings) => {
        if (typeof settings[key] === 'boolean') {
            updateSetting(key, !settings[key] as AppSettings[typeof key]);
        }
    };

    const resetSettings = () => {
        setSettings(defaultSettings as AppSettings);
        saveSettings(defaultSettings);
        document.documentElement.classList.remove("dark");
    };

    return { settings, updateSetting, toggleSetting, resetSettings };
}
