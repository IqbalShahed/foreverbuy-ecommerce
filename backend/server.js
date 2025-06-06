import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import adminRouter from './routes/adminRoute.js';

// App Config
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5174", // frontend URL
    credentials: true
}))
app.use(cookieParser())
connectDB();
connectCloudinary();

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})