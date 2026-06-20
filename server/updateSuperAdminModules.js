import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';

dotenv.config();

const updateSuperAdminModules = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Update super admin modules
    const superAdmin = await User.findOne({ userId: 'ADMIN001' });
    if (superAdmin) {
      superAdmin.modules = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "add_members"];
      await superAdmin.save();
      console.log('Super admin modules updated successfully');
      console.log('User ID:', superAdmin.userId);
      console.log('Modules:', superAdmin.modules);
    } else {
      console.log('Super admin not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating super admin modules:', error);
    process.exit(1);
  }
};

updateSuperAdminModules();
