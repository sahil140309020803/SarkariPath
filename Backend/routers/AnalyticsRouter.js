import express from "express";
import { isAuth } from "../middlewares/IsAuth.js";
import {
    handleHeartbeat,
    handleSessionClose,
    getDashboardCards,
    getDashboardGraphs,
    getAnalyticsUsers
} from "../controllers/AnalyticsController.js";

const router = express.Router();

// Heartbeat & session tracking (public)
router.post("/analytics/heartbeat", handleHeartbeat);
router.post("/analytics/session-close", handleSessionClose);

// Admin Analytics stats (protected)
router.get("/admin/visitor-analytics/cards", isAuth, getDashboardCards);
router.get("/admin/visitor-analytics/graphs", isAuth, getDashboardGraphs);
router.get("/admin/visitor-analytics/users", isAuth, getAnalyticsUsers);

export default router;
