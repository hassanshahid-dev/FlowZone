import express from 'express'
import mongoose from "mongoose"
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import workspaceRoutes from './routes/workspaces.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serverless-aware MongoDB Connection Middleware with Promise Caching & Cloud Fallback
let connectionPromise = null;

const connectDb = async (req, res, next) => {
    if (mongoose.connection.readyState === 1) {
        return next();
    }

    try {
        if (!connectionPromise) {
            const mongoUri = process.env.MONGO_URI || 'mongodb+srv://hassanshahid_05:civic2013oriel@tabflow.h8nfwlr.mongodb.net/tabflow?retryWrites=true&w=majority';
            connectionPromise = mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                bufferCommands: false
            });
        }
        
        await connectionPromise;
        console.log('✅ MongoDB Cloud Atlas Connected cleanly');
        next();
    } catch (err) {
        connectionPromise = null;
        console.warn('⚠️ Cloud MongoDB connection warning:', err.message);
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/tabflow', {
                serverSelectionTimeoutMS: 3000,
                bufferCommands: false
            });
            console.log('✅ Local MongoDB Connected');
            next();
        } catch (localErr) {
            console.error('❌ Database connection error:', localErr.message);
            next(); // Allow in-memory fallback
        }
    }
};

app.use(connectDb);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Test Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'TabFlow API running', dbState: mongoose.connection.readyState });
});

// Local Development Server Listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`🚀 TabFlow Local Backend running on http://localhost:${port}`);
    });
}

export default app;
