import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Workspace from './models/Workspace.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tabflow';
const localUri = 'mongodb://localhost:27017/tabflow';

async function inspectDatabase() {
    console.log('====================================================');
    console.log('📊 TABFLOW ADMIN DATABASE & USER INSPECTOR');
    console.log('====================================================\n');

    try {
        await mongoose.connect(mongoUri).catch(async () => {
            console.log('🔄 Connecting to local database (mongodb://127.0.0.1:27017/tabflow)...');
            await mongoose.connect(localUri);
        });

        console.log('✅ Connected to Database\n');

        // Fetch Users
        const users = await User.find({}, '-password').lean();
        console.log(`👤 REGISTERED USERS (${users.length} Total):`);
        console.log('----------------------------------------------------');
        if (users.length === 0) {
            console.log('No registered users yet.');
        } else {
            users.forEach((u, i) => {
                console.log(`${i + 1}. ID: ${u._id}`);
                console.log(`   Email: ${u.email || u.username || 'N/A'}`);
                console.log(`   Joined: ${u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}`);
                console.log('----------------------------------------------------');
            });
        }

        // Fetch Workspaces
        const workspaces = await Workspace.find({}).lean();
        console.log(`\n📁 SAVED WORKSPACES (${workspaces.length} Total):`);
        console.log('----------------------------------------------------');
        if (workspaces.length === 0) {
            console.log('No saved cloud workspaces yet.');
        } else {
            workspaces.forEach((w, i) => {
                console.log(`${i + 1}. Workspace: "${w.name}" (${w.tabs?.length || 0} Tabs)`);
                console.log(`   User ID: ${w.userId || w.user || 'Guest/Local'}`);
                console.log(`   Tabs: ${(w.tabs || []).map(t => t.title || t.url).slice(0, 3).join(', ')}${w.tabs?.length > 3 ? '...' : ''}`);
                console.log('----------------------------------------------------');
            });
        }

    } catch (err) {
        console.error('❌ Error inspecting database:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n====================================================');
    }
}

inspectDatabase();
