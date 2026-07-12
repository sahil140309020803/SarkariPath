import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import AITopicSummarizer from './controllers/AITopicSummarizer.js';
import { getExamDetails } from './controllers/GetExamDetails.js';
import { updateSyllabusProgress } from './controllers/SyllabusController.js';


import connectMongoDB from './config/mongo_config.js';
import adminRouter from './routers/AdminAuth.js';
import userRouter from './routers/UserAuth.js';
import { isAuth } from './middlewares/IsAuth.js';
import { isAuthenticated } from './controllers/AuthController.js';
import userDetails from './controllers/UserDetails.js';
import categoryRouter from './routers/ExamCategory.js';
import examRouter from './routers/HandleExams.js';
import fetchAllUsers from './controllers/FetchAllUsers.js';
import { setupSocketHandlers } from './controllers/generationController.js';
import fetchActiveTest from './controllers/fetchActiveTest.js';
import testWindowRouter from './routers/TestWindowRouter.js';
import { generationRouter } from './routers/GenerationRouter.js';
import { getTestAnalysis, getLeaderboard, getWeaknessAnalysis, generateAIInsights } from './controllers/GetTestAnalysis.js';
import { submitTest } from './controllers/SubmitTest.js';
import { getUserDashboardData } from './controllers/FetchUserDashboard.js';
import { getDashboardStats, getAnalyticsStats } from './controllers/AdminDashboard.js';
import { generateAdminMock } from './controllers/AdminMockGenerationController.js';
import { validateMock, applyCorrection, regenerateQuestion } from './controllers/AdminMockValidationController.js';
import { generateUserQuiz } from './controllers/QuizGenerationController.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Connect Databases
connectMongoDB(process.env.USER_MONGODB_URI);
connectMongoDB(process.env.EXAM_MONGODB_URI);

// Middlewares
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'http://10.11.224.196:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Setup Socket.IO Server
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.set('socketio', io);

// Listen for WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected via WebSocket:', socket.id);
    setupSocketHandlers(socket, io);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// API end points
app.get('/', (req, res) => res.send("Backend Server is Running"));
app.post('/api/summarize', AITopicSummarizer);


// Auth routes
app.use('/api/auth/admin', adminRouter);
app.use('/api/auth/user', userRouter);
app.get('/api/is-auth', isAuth, isAuthenticated);

// Fetch Past Generations Through Admin Page
app.use('/api/admin/test-generations', isAuth, generationRouter);

// Admin Dashboard stats
app.get('/api/admin/dashboard', isAuth, getDashboardStats);
app.get('/api/admin/analytics', isAuth, getAnalyticsStats);

// User Details routes
app.get('/api/user-details', isAuth, userDetails);

// Fetch all users (for admin)
app.get('/api/users', isAuth, fetchAllUsers);

// Exam Details routes
app.get('/api/exam-details/:examName', isAuth, getExamDetails);

// Exam Category routes
app.use('/api/exam-category', categoryRouter);

// Exam routes
app.use('/api/exams', examRouter);

// Test Window Routes
app.use('/api/test-window', testWindowRouter);

// New Quiz/Mock Generation Routes
app.post('/api/admin/mock/generate', isAuth, generateAdminMock);
app.post('/api/admin/mock/validate', isAuth, validateMock);
app.post('/api/admin/mock/apply-correction', isAuth, applyCorrection);
app.post('/api/admin/mock/regenerate-question', isAuth, regenerateQuestion);
app.post('/api/quiz/generate', isAuth, generateUserQuiz);

// Submit test
app.post('/api/submit-test', isAuth, submitTest);

// Test result
app.get('/api/test-results/:submissionId', isAuth, getTestAnalysis);
app.get('/api/test-leaderboard/:testId', isAuth, getLeaderboard);
app.post('/api/weakness-analysis', isAuth, getWeaknessAnalysis);
app.post('/api/ai-analysis', isAuth, generateAIInsights);

// Fetch User Dashboard Details
app.get('/api/dashboard', isAuth, getUserDashboardData);

// Syllabus Progress Route
app.post('/api/syllabus/update', isAuth, updateSyllabusProgress);

server.listen(PORT, '0.0.0.0', () => console.log(`Server is running with WebSockets on port ${PORT}`));