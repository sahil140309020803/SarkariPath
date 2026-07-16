import { VisitorModel, SessionModel } from "../models/analyticsModel.js";
import userModel from "../models/userModel.js";
import userStatisticsModel from "../models/userStatisticsModel.js";
import jwt from "jsonwebtoken";

// Helper function to proactively close stale sessions older than 2 minutes
export const closeStaleSessions = async () => {
    try {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const timedOutSessions = await SessionModel.find({ isActive: true, lastSeen: { $lt: twoMinutesAgo } });

        for (const session of timedOutSessions) {
            session.isActive = false;
            session.sessionEnd = session.lastSeen || session.updatedAt || new Date();
            session.durationInSeconds = Math.max(
                0,
                Math.round((session.sessionEnd.getTime() - session.sessionStart.getTime()) / 1000)
            );
            await session.save();
        }
    } catch (err) {
        console.error("Error closing stale sessions:", err);
    }
};

// Start background cleanup job running every 60 seconds
setInterval(closeStaleSessions, 60000);

// Heartbeat tracking controller
export const handleHeartbeat = async (req, res) => {
    try {
        const { visitorId, device, browser, userEmail } = req.body;
        if (!visitorId) {
            return res.status(400).json({ success: false, message: "visitorId is required" });
        }



        // Backend Failsafe: Check if request is authenticated as an Admin
        const { token } = req.cookies || {};
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && decoded.role === 'admin') {
                    // Scrub any visitor/session records previously created for this visitorId (e.g. during login screen load)
                    await VisitorModel.deleteOne({ visitorId });
                    await SessionModel.deleteMany({ visitorId });
                    return res.status(200).json({ success: true, tracking: false, message: "Admins are not tracked" });
                }
            } catch (err) {
                // Token invalid/expired, continue as regular visitor
            }
        }

        const now = new Date();
        let userObj = null;

        if (userEmail) {
            userObj = await userModel.findOne({ email: userEmail });
        }

        const expectedUserId = userObj ? userObj._id : null;

        // 1. Find or create Visitor document (permanent record per browser)
        let visitor = await VisitorModel.findOne({ visitorId });
        if (!visitor) {
            visitor = new VisitorModel({
                visitorId,
                firstVisit: now,
                device,
                browser
            });
            await visitor.save();
        }

        // 2. Find the active session for the visitor
        let activeSession = await SessionModel.findOne({ visitorId, isActive: true });

        if (activeSession) {
            // Check if authentication status changed
            const currentSessionUserIdStr = activeSession.userId ? activeSession.userId.toString() : null;
            const expectedUserIdStr = expectedUserId ? expectedUserId.toString() : null;

            if (currentSessionUserIdStr !== expectedUserIdStr) {
                // Auth status changed (e.g., login, logout, or user switch)
                // Immediately close the current session
                activeSession.isActive = false;
                activeSession.sessionEnd = now;
                activeSession.durationInSeconds = Math.max(
                    0,
                    Math.round((activeSession.sessionEnd.getTime() - activeSession.sessionStart.getTime()) / 1000)
                );
                await activeSession.save();

                // Immediately create a brand-new session with the new auth status
                activeSession = new SessionModel({
                    visitorId,
                    userId: expectedUserId,
                    sessionStart: now,
                    lastSeen: now,
                    isActive: true
                });
                await activeSession.save();
            } else {
                // Auth status unchanged, only update lastSeen
                activeSession.lastSeen = now;
                await activeSession.save();
            }
        } else {
            // No active session exists (first visit or after cleanup expired/closed it)
            // Create a brand-new session
            activeSession = new SessionModel({
                visitorId,
                userId: expectedUserId,
                sessionStart: now,
                lastSeen: now,
                isActive: true
            });
            await activeSession.save();
        }

        return res.status(200).json({
            success: true,
            sessionId: activeSession._id,
            visitorId: visitor.visitorId
        });
    } catch (error) {
        console.error("Heartbeat Analytics Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// End session controller
export const handleSessionClose = async (req, res) => {
    try {
        const { visitorId } = req.body;
        if (!visitorId) {
            return res.status(400).json({ success: false, message: "visitorId is required" });
        }

        const now = new Date();
        const activeSession = await SessionModel.findOne({ visitorId, isActive: true });

        if (activeSession) {
            activeSession.isActive = false;
            activeSession.sessionEnd = now;
            activeSession.durationInSeconds = Math.max(
                0,
                Math.round((activeSession.sessionEnd.getTime() - activeSession.sessionStart.getTime()) / 1000)
            );
            await activeSession.save();
        }

        return res.status(200).json({ success: true, message: "Session closed successfully" });
    } catch (error) {
        console.error("Session Close Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin Dashboard Cards Stats
export const getDashboardCards = async (req, res) => {
    try {
        // Proactively close any stale sessions before calculations
        await closeStaleSessions();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayStr = new Date().toISOString().split('T')[0];

        // Perform parallel db requests
        const [
            totalVisitors,
            onlineUsers,
            returningVisitorsAgg,
            newVisitorsToday,
            totalRegisteredUsers,
            registrationsToday,
            registeredVisitorsAgg,
            websiteVisits,
            totalDurationAggregation,
            returningVisitorsTodayAgg,
            totalTestsAggregation,
            todayTestsAggregation,
            todayWebsiteVisits
        ] = await Promise.all([
            VisitorModel.countDocuments(),
            SessionModel.countDocuments({ isActive: true }),
            SessionModel.aggregate([
                { $group: { _id: "$visitorId", count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $count: "count" }
            ]),
            VisitorModel.countDocuments({ firstVisit: { $gte: startOfToday } }),
            userModel.countDocuments(),
            userModel.countDocuments({ createdAt: { $gte: startOfToday } }),
            SessionModel.aggregate([
                { $match: { userId: { $ne: null } } },
                { $group: { _id: "$visitorId" } },
                { $count: "count" }
            ]),
            SessionModel.countDocuments(),
            SessionModel.aggregate([
                { $group: { _id: null, totalDuration: { $sum: "$durationInSeconds" } } }
            ]),
            SessionModel.aggregate([
                { $match: { sessionStart: { $gte: startOfToday } } },
                { $group: { _id: "$visitorId" } },
                {
                    $lookup: {
                        from: "sessions",
                        localField: "_id",
                        foreignField: "visitorId",
                        as: "allSessions"
                    }
                },
                { $match: { "allSessions.1": { $exists: true } } },
                { $count: "count" }
            ]),
            userStatisticsModel.aggregate([
                { $group: { _id: null, total: { $sum: "$testsAttempted" } } }
            ]),
            userStatisticsModel.aggregate([
                { $unwind: "$dailyStatistics" },
                { $match: { "dailyStatistics.date": todayStr } },
                { $group: { _id: null, total: { $sum: "$dailyStatistics.testsAttempted" } } }
            ]),
            SessionModel.countDocuments({ sessionStart: { $gte: startOfToday } })
        ]);

        const returningVisitors = returningVisitorsAgg.length > 0 ? returningVisitorsAgg[0].count : 0;
        const registeredVisitorsCount = registeredVisitorsAgg.length > 0 ? registeredVisitorsAgg[0].count : 0;
        const totalDuration = totalDurationAggregation.length > 0 ? totalDurationAggregation[0].totalDuration : 0;
        const avgTimePerUser = totalVisitors > 0 ? Math.round(totalDuration / totalVisitors) : 0;
        const totalTestsAttempted = totalTestsAggregation.length > 0 ? totalTestsAggregation[0].total : 0;
        const testsAttemptedToday = todayTestsAggregation.length > 0 ? todayTestsAggregation[0].total : 0;
        const returningVisitorsToday = returningVisitorsTodayAgg.length > 0 ? returningVisitorsTodayAgg[0].count : 0;

        // Visitor -> Registration Conversion Rate
        const conversionRate = totalVisitors > 0
            ? parseFloat(((registeredVisitorsCount / totalVisitors) * 100).toFixed(2))
            : 0;

        return res.status(200).json({
            success: true,
            stats: {
                totalVisitors,
                onlineUsers,
                returningVisitors,
                newVisitorsToday,
                totalRegisteredUsers,
                registrationsToday,
                conversionRate,
                websiteVisits,
                avgTimePerUser,
                testsAttemptedToday,
                totalTestsAttempted,
                returningVisitorsToday,
                todayWebsiteVisits
            }
        });
    } catch (error) {
        console.error("Dashboard Cards Stats Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin Dashboard Graphs
export const getDashboardGraphs = async (req, res) => {
    try {
        // Proactively close any stale sessions before calculations
        await closeStaleSessions();

        const last7Days = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            last7Days.push(`${year}-${month}-${day}`);
        }

        const [durationStats, visitorStats, registrationStats, testStats] = await Promise.all([
            SessionModel.aggregate([
                { $match: { sessionStart: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$sessionStart" } },
                            visitorId: "$visitorId"
                        },
                        duration: { $sum: "$durationInSeconds" }
                    }
                },
                {
                    $group: {
                        _id: "$_id.date",
                        uniqueVisitorsCount: { $sum: 1 },
                        totalDuration: { $sum: "$duration" }
                    }
                }
            ]),
            VisitorModel.aggregate([
                { $match: { firstVisit: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$firstVisit" } },
                        count: { $sum: 1 }
                    }
                }
            ]),
            userModel.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                }
            ]),
            userStatisticsModel.aggregate([
                { $unwind: "$dailyStatistics" },
                { $match: { "dailyStatistics.date": { $in: last7Days } } },
                {
                    $group: {
                        _id: "$dailyStatistics.date",
                        count: { $sum: "$dailyStatistics.testsAttempted" }
                    }
                }
            ])
        ]);

        const durationMap = Object.fromEntries(
            durationStats.map(d => {
                const avg = d.uniqueVisitorsCount > 0 ? Math.round((d.totalDuration || 0) / d.uniqueVisitorsCount / 60) : 0;
                return [d._id, avg];
            })
        );
        const visitorMap = Object.fromEntries(visitorStats.map(v => [v._id, v.count]));
        const registrationMap = Object.fromEntries(registrationStats.map(r => [r._id, r.count]));
        const testMap = Object.fromEntries(testStats.map(t => [t._id, t.count]));

        const chartData = last7Days.map(date => ({
            date,
            avgTimePerUser: durationMap[date] || 0, // in minutes
            visitors: visitorMap[date] || 0,
            registrations: registrationMap[date] || 0,
            testAttempts: testMap[date] || 0
        }));

        return res.status(200).json({
            success: true,
            chartData
        });
    } catch (error) {
        console.error("Dashboard Graphs Stats Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch users detail list for User Management table
export const getAnalyticsUsers = async (req, res) => {
    try {
        // Proactively close any stale sessions before calculations
        await closeStaleSessions();

        const { search, status } = req.query;

        // Fetch users
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await userModel.find(query).lean();
        const userIds = users.map(u => u._id);

        // Fetch user stats
        const userStats = await userStatisticsModel.find({ userId: { $in: userIds } }).lean();
        const statsMap = new Map(userStats.map(s => [s.userId.toString(), s]));

        // Fetch active sessions for online status
        const activeSessions = await SessionModel.find({ userId: { $in: userIds }, isActive: true }).lean();
        const activeSessionMap = new Map(activeSessions.map(s => [s.userId.toString(), s]));

        // Fetch session counts per user for total visits
        const userSessionsCountAgg = await SessionModel.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: "$userId", count: { $sum: 1 } } }
        ]);
        const userVisitsMap = new Map(userSessionsCountAgg.map(item => [item._id.toString(), item.count]));

        // Fetch sessions for active time calculation (last 7 days sessions)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const sessions = await SessionModel.find({
            userId: { $in: userIds },
            sessionStart: { $gte: sevenDaysAgo }
        }).lean();

        // Group sessions by userId
        const sessionsMap = new Map();
        userIds.forEach(id => sessionsMap.set(id.toString(), []));
        sessions.forEach(s => {
            if (s.userId) {
                const uid = s.userId.toString();
                if (sessionsMap.has(uid)) {
                    sessionsMap.get(uid).push(s);
                }
            }
        });

        const now = new Date();

        // Construct user list response
        let userList = users.map(user => {
            const userIdStr = user._id.toString();
            const stats = statsMap.get(userIdStr);
            const userSessions = sessionsMap.get(userIdStr) || [];

            // Online status
            const isOnline = activeSessionMap.has(userIdStr);

            // Visits
            const visits = userVisitsMap.get(userIdStr) || 0;

            // Today's active time
            let todaySeconds = 0;
            let weeklySeconds = 0;

            userSessions.forEach(session => {
                const sStart = new Date(session.sessionStart);
                let duration = session.durationInSeconds || 0;

                // If session is active right now, add current duration
                if (session.isActive) {
                    duration = Math.max(0, Math.round((now.getTime() - sStart.getTime()) / 1000));
                }

                // Add to weekly
                weeklySeconds += duration;

                // Add to today
                if (sStart >= startOfToday) {
                    todaySeconds += duration;
                }
            });

            // Format durations
            const formatDuration = (totalSecs) => {
                if (totalSecs < 60) return "0 min";
                const mins = Math.floor(totalSecs / 60);
                if (mins < 60) return `${mins} min`;
                const hrs = Math.floor(mins / 60);
                const remainingMins = mins % 60;
                return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
            };

            return {
                id: userIdStr,
                name: user.name,
                email: user.email,
                status: isOnline ? "Online" : "Offline",
                visits,
                todayActiveTime: formatDuration(todaySeconds),
                weeklyActiveTime: formatDuration(weeklySeconds),
                testsAttempted: stats ? stats.testsAttempted : 0
            };
        });

        // Filter by online/offline status if parameter matches
        if (status === 'online') {
            userList = userList.filter(u => u.status === 'Online');
        } else if (status === 'offline') {
            userList = userList.filter(u => u.status === 'Offline');
        }

        return res.status(200).json({
            success: true,
            users: userList
        });
    } catch (error) {
        console.error("Fetch Analytics Users Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
