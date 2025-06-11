import express from 'express';
import { userLogin, registerUser, getUserData, userLogout } from '../controllers/userController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', userLogin);
userRouter.get('/deshboard', verifyUser, getUserData);
userRouter.post('/logout', verifyUser, userLogout);

export default userRouter;