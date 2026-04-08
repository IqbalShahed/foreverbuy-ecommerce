import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined");
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME || "foreverbuy",
        });
        console.log('DB Connected');

        mongoose.connection.on('error', (err) => {
            console.error('DB Connection Error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('DB Disconnected');
        });
    } catch (error) {
        console.error('DB Connection Failed:', error);
        process.exit(1);
    }
};

export default connectDB;
