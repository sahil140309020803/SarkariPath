import express from 'express';
import { isAuthenticated, logout, register, userLogin, googleLogin, verifyOtp, resendOtp, forgotPassword, verifyForgotPasswordOtp, resetPassword } from '../controllers/AuthController.js';
import { isAuth } from '../middlewares/IsAuth.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', userLogin);
userRouter.post('/google-login', googleLogin);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/resend-otp', resendOtp);
userRouter.post('/logout', isAuth, logout);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
userRouter.post('/reset-password', resetPassword);


export default userRouter;