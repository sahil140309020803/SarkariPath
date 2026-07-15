import ReactGA from 'react-ga4';

let isInitialized = false;

/**
 * Initializes Google Analytics 4 (GA4) with the Measurement ID
 * from environment variables. Ensures initialization happens only once.
 */
export const initAnalytics = () => {
    if (isInitialized) return;

    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    // Do not initialize if the measurement ID is missing or has placeholder G-XXXXXXXXXX value
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
        if (import.meta.env.DEV) {
            console.warn('[GA4] Measurement ID is missing or placeholder. Skipping initialization.');
        }
        return;
    }

    try {
        ReactGA.initialize(measurementId);
        isInitialized = true;
        if (import.meta.env.DEV) {
            console.log('[GA4] Analytics initialized successfully with ID:', measurementId);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[GA4] Initialization failed:', error);
        }
        // Silently ignore in production
    }
};

/**
 * Tracks a pageview event for the given path.
 * @param {string} path - The URL path to track (e.g., /home, /dashboard)
 */
export const trackPageView = (path) => {
    if (!isInitialized) return;

    try {
        ReactGA.send({
            hitType: 'pageview',
            page: path,
            title: document.title
        });
        if (import.meta.env.DEV) {
            console.log('[GA4] Pageview tracked:', path);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('[GA4] Tracking pageview failed:', error);
        }
    }
};

/**
 * Sends a custom event with GA4 style custom parameters.
 * @param {string} eventName - Name of the event (e.g., login, submit_quiz)
 * @param {object} [parameters] - Event custom parameters
 */
export const trackEvent = (eventName, parameters = {}) => {
    if (!isInitialized) return;

    try {
        ReactGA.event(eventName, parameters);
        if (import.meta.env.DEV) {
            console.log(`[GA4] Event tracked: "${eventName}" with parameters:`, parameters);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error(`[GA4] Tracking event "${eventName}" failed:`, error);
        }
    }
};
