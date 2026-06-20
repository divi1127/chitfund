import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';

dotenv.config();

const resetPassword = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Reset admin password
    const admin = await User.findOne({ userId: 'ADMIN001' });
    if (admin) {
      admin.password = 'admin123';
      await admin.save();
      console.log('Admin password reset successfully');
      console.log('User ID:', admin.userId);
      console.log('Password:', admin.password);
    } else {
      console.log('Admin not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
