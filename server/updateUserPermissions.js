import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';

dotenv.config();

const updateUserPermissions = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Update regular user permissions
    const user = await User.findOne({ userId: 'USER001' });
    if (user) {
      user.modules = ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'];
      await user.save();
      console.log('User permissions updated successfully');
      console.log('User ID:', user.userId);
      console.log('Modules:', user.modules);
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating user permissions:', error);
    process.exit(1);
  }
};

updateUserPermissions();
