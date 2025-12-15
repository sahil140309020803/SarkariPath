import express from 'express';
import fetchActiveTest from '../controllers/fetchActiveTest.js';


const testWindowRouter = express.Router();

testWindowRouter.get('/active-test/:testID', fetchActiveTest);

export default testWindowRouter;