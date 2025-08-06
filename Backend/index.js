import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import AITopicSummarizer from './controllers/AITopicSummarizer.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'http://192.168.141.196:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));


// API end points
app.get('/', (req, res) => res.send("Backend Server is Running"));
app.post('/api/summarize', AITopicSummarizer);

app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));