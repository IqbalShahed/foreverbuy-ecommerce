import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import adminRouter from './routes/adminRoute.js';
import cartRoute from './routes/cartRoute.js';
import orderRoute from './routes/orderRoute.js';
import aiRouter from './routes/aiRoute.js';

// App Config
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(cookieParser())
connectDB();
connectCloudinary();

app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy" });
});

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cart/', cartRoute);
app.use('/api/order', orderRoute);
app.use('/api/ai', aiRouter);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ success: false, message: err.message });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})
