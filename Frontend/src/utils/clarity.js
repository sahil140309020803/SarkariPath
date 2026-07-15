import Clarity from '@microsoft/clarity';

let isInitialized = false;

/**
 * Initializes Microsoft Clarity with the Project ID from environment variables.
 * Ensures initialization happens only once — safe to call at module level.
 */
export const initClarity = () => {
    if (isInitialized) return;

    const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

    if (!projectId || projectId === 'YOUR_PROJECT_ID') {
        if (import.meta.env.DEV) {
            console.warn('[Clarity] Project ID is missing or placeholder. Skipping initialization.');
        }
        return;
    }

    try {
        Clarity.init(projectId);
        isInitialized = true;
        if (import.meta.env.DEV) {
            console.log('[Clarity] Initialized successfully with project ID:', projectId);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[Clarity] Initialization failed:', error);
        }
        // Silently ignore in production
    }
};

/**
 * Identifies the current user in Microsoft Clarity.
 * Call this after a successful login.
 * @param {string} userId   - Unique user identifier
 * @param {string} [email]  - User email (used as session identifier in Clarity)
 * @param {string} [name]   - Friendly display name (used as page identifier in Clarity)
 */
export const identifyUser = (userId, email, name) => {
    if (!isInitialized) return;

    try {
        // Clarity.identify(customId, customSessionId, customPageId, friendlyName)
        Clarity.identify(userId, email, name, name);
        if (import.meta.env.DEV) {
            console.log('[Clarity] User identified:', { userId, email, name });
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[Clarity] identifyUser failed:', error);
        }
    }
};

/**
 * Clears the current user identity from Clarity (call on logout).
 * Uses "guest" as the anonymous fallback identifier.
 */
export const clearUser = () => {
    if (!isInitialized) return;

    try {
        Clarity.identify('guest', undefined, undefined, 'Guest');
        if (import.meta.env.DEV) {
            console.log('[Clarity] User identity cleared (reset to guest).');
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[Clarity] clearUser failed:', error);
        }
    }
};

/**
 * Sets a custom key-value tag on the current Clarity session.
 * Useful for segmenting recordings (e.g., plan type, user role).
 * @param {string} key   - Tag name
 * @param {string} value - Tag value
 */
export const setTag = (key, value) => {
    if (!isInitialized) return;

    try {
        Clarity.setTag(key, value);
        if (import.meta.env.DEV) {
            console.log(`[Clarity] Tag set: ${key} = ${value}`);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[Clarity] setTag failed:', error);
        }
    }
};

/**
 * Fires a custom event in the current Clarity session.
 * @param {string} eventName - Name of the event (e.g., "login", "start_quiz")
 */
export const trackEvent = (eventName) => {
    if (!isInitialized) return;

    try {
        Clarity.event(eventName);
        if (import.meta.env.DEV) {
            console.log(`[Clarity] Event tracked: "${eventName}"`);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error(`[Clarity] trackEvent "${eventName}" failed:`, error);
        }
    }
};
