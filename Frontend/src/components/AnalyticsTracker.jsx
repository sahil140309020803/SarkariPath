import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Headless tracking component that automatically triggers pageview events
 * in GA4 whenever the React Router path changes.
 */
const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const fullPath = location.pathname + location.search;
        trackPageView(fullPath);
    }, [location.pathname, location.search]);

    return null;
};

export default AnalyticsTracker;
