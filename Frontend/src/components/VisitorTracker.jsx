import React, { useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const VisitorTracker = () => {
    const { userDetails, isLoading, backend_url } = useUser();

    const getDeviceAndBrowser = () => {
        const ua = navigator.userAgent;
        let browser = "Unknown Browser";
        let device = "Desktop";

        if (/mobile/i.test(ua)) {
            device = "Mobile";
        } else if (/tablet|ipad/i.test(ua)) {
            device = "Tablet";
        }

        if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) {
            browser = "Chrome";
        } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
            browser = "Safari";
        } else if (/firefox|fxios/i.test(ua)) {
            browser = "Firefox";
        } else if (/edge|edg/i.test(ua)) {
            browser = "Edge";
        } else if (/opr/i.test(ua)) {
            browser = "Opera";
        }
        return { device, browser };
    };

    const sendHeartbeat = async (isInitial = false) => {
        try {
            let id = localStorage.getItem('visitorId');
            if (!id) {
                id = crypto.randomUUID ? crypto.randomUUID() : 'visitor_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
                localStorage.setItem('visitorId', id);
            }
            const { device, browser } = getDeviceAndBrowser();
            const email = userDetails?.email || null;

            await axios.post(`${backend_url}/api/analytics/heartbeat`, {
                visitorId: id,
                device,
                browser,
                userEmail: email,
                isInitial
            }, { withCredentials: true });
        } catch (err) {
            // Silently fail or ignore error
        }
    };

    // Initial heartbeat and 30s interval
    useEffect(() => {
        if (isLoading) return;
        if (userDetails?.role === 'admin') return;

        sendHeartbeat(true);
        const interval = setInterval(() => sendHeartbeat(false), 30000);

        return () => {
            clearInterval(interval);
        };
    }, [backend_url, isLoading, userDetails]);

    return null;
};

export default VisitorTracker;
