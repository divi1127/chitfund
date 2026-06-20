import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';

dotenv.config();

const ALL_MODULES = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "add_members"];
const ALL_PERMISSIONS = ["create", "edit", "delete", "view"];

const seedUsers = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ userId: 'ADMIN001' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
    } else {
      // Create default super admin
      const superAdmin = new User({
        userId: 'ADMIN001',
        password: 'admin123', // In production, hash this with bcrypt
        name: 'Super Admin',
        email: 'admin@hrchits.com',
        role: 'super_admin',
        modules: ALL_MODULES,
        permissions: ALL_PERMISSIONS,
        status: 'active'
      });
      await superAdmin.save();
      console.log('Super admin created successfully');
      console.log('User ID: ADMIN001');
      console.log('Password: admin123');
    }

    // Create a sample sub admin
    const existingSubAdmin = await User.findOne({ userId: 'SUB001' });
    if (existingSubAdmin) {
      console.log('Sub admin already exists');
    } else {
      const subAdmin = new User({
        userId: 'SUB001',
        password: 'sub123',
        name: 'Sub Admin',
        email: 'subadmin@hrchits.com',
        role: 'sub_admin',
        modules: ['dashboard', 'members', 'collections', 'reports'],
        permissions: ['view'],
        status: 'active'
      });
      await subAdmin.save();
      console.log('Sub admin created successfully');
      console.log('User ID: SUB001');
      console.log('Password: sub123');
    }

    // Create a sample regular user
    const existingUser = await User.findOne({ userId: 'USER001' });
    if (existingUser) {
      console.log('Regular user already exists');
    } else {
      const regularUser = new User({
        userId: 'USER001',
        password: 'user123',
        name: 'John Doe',
        email: 'john@hrchits.com',
        role: 'user',
        modules: ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'],
        permissions: ['view'],
        status: 'active'
      });
      await regularUser.save();
      console.log('Regular user created successfully');
      console.log('User ID: USER001');
      console.log('Password: user123');
    }

    console.log('User seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
