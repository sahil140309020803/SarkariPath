import ReactGA from 'react-ga4';

let isInitialized = false;

export const initAnalytics = () => {
    if (isInitialized) return;

    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    // Do not initialize if the measurement ID is missing or has placeholder G-XXXXXXXXXX value
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
        return;
    }

    try {
        ReactGA.initialize(measurementId);
        isInitialized = true;
    } catch (error) {
        // Silently ignore
    }
};

export const trackPageView = (path) => {
    if (!isInitialized) return;

    try {
        ReactGA.send({
            hitType: 'pageview',
            page: path,
            title: document.title
        });
    } catch (error) {
        // Silently ignore
    }
};

export const trackEvent = (eventName, parameters = {}) => {
    if (!isInitialized) return;

    try {
        ReactGA.event(eventName, parameters);
    } catch (error) {
        // Silently ignore
    }
};
