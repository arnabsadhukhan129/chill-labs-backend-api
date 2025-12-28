import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './config';

// Load environment variables
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

const connectDB = async (): Promise<void> => {
    try {
        console.log(`⌛️ Connecting to MongoDB at ${dbConfig.uri}...`);

        await mongoose.connect(dbConfig.uri, dbConfig.options);

        console.log('✅ MongoDB Connected Successfully');

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT received: closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received: closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

export default connectDB;
