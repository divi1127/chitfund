import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import User from './models/User.js';

dotenv.config();

const ALL_MODULES = ["dashboard","members","schemes","groups","collections","billing","auctions","prizes","accounting","reports","branches","notifications","settings","profile","add-members","user-management"];
const ALL_PERMISSIONS = ["create","edit","delete","view"];

const users = [
  {
    userId: 'ADMIN001', password: 'admin123', name: 'Super Admin',
    email: 'admin@hrchits.com', role: 'super_admin',
    modules: ALL_MODULES, permissions: ALL_PERMISSIONS,
  },
  {
    userId: 'SUB001', password: 'sub123', name: 'Sub Admin',
    email: 'subadmin@hrchits.com', role: 'sub_admin',
    modules: ['dashboard','members','collections','reports'],
    permissions: ['view','create','edit'],
  },
  {
    userId: 'USER001', password: 'user123', name: 'John Doe',
    email: 'john@hrchits.com', role: 'user',
    modules: ['dashboard','members','schemes','groups','collections','billing','auctions','accounting','profile','payments'],
    permissions: ['view'],
  },
];

const seed = async () => {
  await connectDB();

  for (const u of users) {
    const existing = await User.findOne({ userId: u.userId });
    const hashed = await bcrypt.hash(u.password, 10);

    if (existing) {
      await User.updateOne({ userId: u.userId }, { password: hashed, modules: u.modules, permissions: u.permissions, status: 'active' });
      console.log(`✅ Updated: ${u.userId}`);
    } else {
      await User.create({ ...u, password: hashed, status: 'active' });
      console.log(`✅ Created: ${u.userId}`);
    }
  }

  console.log('\nLogin credentials:');
  console.log('  ADMIN001 / admin123  (Super Admin)');
  console.log('  SUB001   / sub123    (Sub Admin)');
  console.log('  USER001  / user123   (User)');
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
