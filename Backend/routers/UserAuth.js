import express from 'express';
import { isAuthenticated, logout, register, userLogin, googleLogin } from '../controllers/AuthController.js';
import { isAuth } from '../middlewares/IsAuth.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login',userLogin);
userRouter.post('/google-login', googleLogin);
userRouter.post('/logout', isAuth, logout);


export default userRouter;