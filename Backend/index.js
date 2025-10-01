import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import AITopicSummarizer from './controllers/AITopicSummarizer.js';
import getExamDetails from './controllers/GetExamDetails.js';
import { generateMockTest } from './controllers/GenerateMockTest.js';
import { generateQuiz } from './controllers/generateTest.js';
import connectMongoDB from './config/mongo_config.js';
import adminRouter from './routers/AdminAuth.js';
import userRouter from './routers/UserAuth.js';
import { isAuth } from './middlewares/IsAuth.js';
import { isAuthenticated } from './controllers/AuthController.js';
import userDetails from './controllers/UserDetails.js';
import categoryRouter from './routers/ExamCategory.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Connect User Database
connectMongoDB(process.env.USER_MONGODB_URI)
// Connect Exam Database
connectMongoDB(process.env.EXAM_MONGODB_URI)

// Middlewares
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'http://172.16.170.72:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));


// API end points
app.get('/', (req, res) => res.send("Backend Server is Running"));
app.post('/api/summarize', AITopicSummarizer);


// app.post('/api/generate-mock-test', generateMockTest);
// app.post('/api/generate-mock-test', generateQuiz);

// Auth routes
app.use('/api/auth/admin', adminRouter);
app.use('/api/auth/user', userRouter);
app.get('/api/is-auth', isAuth, isAuthenticated);

// User routes
app.get('/api/user-details', isAuth, userDetails);

// Exam Details routes
app.get('/api/exam-details/:examId', getExamDetails);

// Exam Category routes
app.use('/api/exam-category', categoryRouter);



app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));