const mongoose = require('mongoose');

// Database configuration
const mongoUri = process.env.MONGO_URI || "mongodb+srv://ankushpandit2043_db_user:1nqfdrVDwkwTYdLB@cluster0.ugvhnxw.mongodb.net/costoptimizer?retryWrites=true&w=majority&appName=Cluster0";

// Connection options
const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // maxPoolSize: 10, // Maximum number of connections in the pool
    // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    // socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    // bufferMaxEntries: 0, // Disable mongoose buffering
    // bufferCommands: false, // Disable mongoose buffering
};

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoUri, connectionOptions);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB connection closure:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        // Don't crash the app in development, but log the error
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

// Export both the connection function and mongoose instance
module.exports = { connectDB, mongoose };
