import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://hassanshahid_05:civic2013oriel@tabflow.h8nfwlr.mongodb.net/tabflow?retryWrites=true&w=majority';

async function testMobileAuth() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Cloud Atlas');

    const user = await User.findOne({ email: 'grandhassan66@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'tabflow_jwt_secret',
      { expiresIn: '30d' }
    );

    console.log('🔑 Generated Live JWT Token:', token.substring(0, 30) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tabflow_jwt_secret');
    console.log('✅ Token decoded user ID:', decoded.id);

    const workspaces = await Workspace.find({ userId: decoded.id });
    console.log(`\n🎉 WORKSPACES FETCHED FOR MOBILE DEVICE (${workspaces.length}):`);
    workspaces.forEach(w => console.log(` - "${w.name}" (${w.tabs?.length} tabs)`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testMobileAuth();
