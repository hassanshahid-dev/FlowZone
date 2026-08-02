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

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

//test
app.get('/', (req, res) => {
    res.json({ message: 'TabFlow API running' });
});

//DB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tabflow';
const localUri = 'mongodb://127.0.0.1:27017/tabflow';

const startServer = () => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`🚀 TabFlow Backend Server running on http://localhost:${port}`);
    });
};

mongoose.connect(mongoUri)
    .then(() => {
        console.log(`✅ MongoDB connected successfully`);
        startServer();
    })
    .catch((err) => {
        console.warn('⚠️ Cloud MongoDB connection warning:', err.message);
        console.log('🔄 Connecting to local MongoDB instance (mongodb://127.0.0.1:27017/tabflow)...');
        mongoose.connect(localUri)
            .then(() => {
                console.log(`✅ Local MongoDB connected successfully`);
                startServer();
            })
            .catch((localErr) => {
                console.error('❌ Local MongoDB connection error:', localErr.message);
                console.log('⚡ Starting server in offline memory mode on port 5000...');
                startServer();
            });
    });

export default app;

