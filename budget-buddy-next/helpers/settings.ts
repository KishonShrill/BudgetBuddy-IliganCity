// 1. Define the interface to be the single source of truth for your app
export interface AppSettings {
    hidePhotos: boolean;
    rightToLeft: boolean;
    soundEffects: boolean;
    notifications: boolean;
    budgetAlerts: boolean;
}

const SETTINGS_KEY = 'budgetbuddySettings';

// 2. Apply the interface to your defaults
export const defaultSettings: AppSettings = {
    hidePhotos: false,
    rightToLeft: false,
    soundEffects: false,
    notifications: false,
    budgetAlerts: false,
};

// Load from localStorage or fallback to defaults
export function loadSettings(): AppSettings {
    // Next.js Safety Check: If we are on the server, just return defaults
    if (typeof window === 'undefined') {
        return defaultSettings;
    }

    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? (JSON.parse(stored) as AppSettings) : defaultSettings;
}

// Save to localStorage
export function saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// 3. Use Generics to strictly type the keys and values
export function toggleSetting<K extends keyof AppSettings>(key: K): AppSettings {
    const settings = loadSettings();

    if (typeof settings[key] === 'boolean') {
        // We cast it to boolean here so TS knows it's safe to invert
        (settings[key] as boolean) = !settings[key];
        saveSettings(settings);
    }
    return settings;
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): AppSettings {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
    return settings;
}
