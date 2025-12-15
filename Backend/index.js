import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import AITopicSummarizer from './controllers/AITopicSummarizer.js';
import {getExamDetails} from './controllers/GetExamDetails.js';


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

const app = express();
const server = http.createServer(app); 
const PORT = process.env.PORT || 4000;

// Connect Databases
connectMongoDB(process.env.USER_MONGODB_URI);
connectMongoDB(process.env.EXAM_MONGODB_URI);

// Middlewares
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'http://172.16.170.72:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Setup Socket.IO Server
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

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

// User Details routes
app.get('/api/user-details', isAuth, userDetails);

// Fetch all users (for admin)
app.get('/api/users', isAuth, fetchAllUsers);

// Exam Details routes
app.get('/api/exam-details/:examName', getExamDetails);

// Exam Category routes
app.use('/api/exam-category', categoryRouter);

// Exam routes
app.use('/api/exams', examRouter);

// Test Window Routes
app.use('/api/test-window', testWindowRouter); // Assuming test window related routes are in examRouter


server.listen(PORT, '0.0.0.0', () => console.log(`Server is running with WebSockets on port ${PORT}`));