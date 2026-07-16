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
        return;
    }

    try {
        Clarity.init(projectId);
        isInitialized = true;
    } catch (error) {
        // Silently ignore
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
    } catch (error) {
        // Silently ignore
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
    } catch (error) {
        // Silently ignore
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
    } catch (error) {
        // Silently ignore
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
    } catch (error) {
        // Silently ignore
    }
};
