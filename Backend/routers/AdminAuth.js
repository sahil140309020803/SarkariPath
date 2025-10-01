import express from 'express';
import { adminLogin, isAuthenticated, logout } from '../controllers/AuthController.js';
import { isAuth } from '../middlewares/IsAuth.js';

const adminRouter = express.Router();

adminRouter.post('/login',adminLogin);
adminRouter.post('/logout', isAuth, logout);

export default adminRouter;