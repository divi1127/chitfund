import mongoose from 'mongoose';
import { connectDB } from './db.js';
import Agent from './models/Agent.js';
import Member from './models/Member.js';
import Scheme from './models/Scheme.js';
import Branch from './models/Branch.js';
import User from './models/User.js';

const AGENT_MODULES = ["dashboard", "members", "schemes", "groups", "collections", "profile"];
const MEMBER_MODULES = ["dashboard", "profile", "payments", "notifications"];

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      Agent.deleteMany({}),
      Member.deleteMany({}),
      Scheme.deleteMany({}),
      Branch.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const schemes = await Scheme.insertMany([
      {
        id: 'SC001',
        name: '₹25,000 Chit Scheme',
        amount: 25000,
        duration: 10,
        members: 10,
        monthlyInstallment: 2500,
        commission: 5,
        status: 'Active',
        monthlyAmounts: [
          { month: 1, amount: 2500, auctionAmount: 0 },
          { month: 2, amount: 2050, auctionAmount: 19750 },
          { month: 3, amount: 2100, auctionAmount: 20375 },
          { month: 4, amount: 2150, auctionAmount: 20875 },
          { month: 5, amount: 2200, auctionAmount: 21375 },
          { month: 6, amount: 2250, auctionAmount: 21875 },
          { month: 7, amount: 2315, auctionAmount: 22500 },
          { month: 8, amount: 2375, auctionAmount: 23125 },
          { month: 9, amount: 2425, auctionAmount: 23750 },
          { month: 10, amount: 2500, auctionAmount: 25000 },
        ],
      },
      {
        id: 'SC002',
        name: '₹50,000 Chit Scheme',
        amount: 50000,
        duration: 10,
        members: 10,
        monthlyInstallment: 5000,
        commission: 5,
        status: 'Active',
        monthlyAmounts: [
          { month: 1, amount: 5000, auctionAmount: 0 },
          { month: 2, amount: 4100, auctionAmount: 39500 },
          { month: 3, amount: 4200, auctionAmount: 40750 },
          { month: 4, amount: 4300, auctionAmount: 41750 },
          { month: 5, amount: 4400, auctionAmount: 42750 },
          { month: 6, amount: 4500, auctionAmount: 43750 },
          { month: 7, amount: 4650, auctionAmount: 45000 },
          { month: 8, amount: 4750, auctionAmount: 46250 },
          { month: 9, amount: 4850, auctionAmount: 47500 },
          { month: 10, amount: 5000, auctionAmount: 50000 },
        ],
      },
      {
        id: 'SC003',
        name: '₹1,00,000 Chit Scheme',
        amount: 100000,
        duration: 10,
        members: 10,
        monthlyInstallment: 10000,
        commission: 5,
        status: 'Active',
        monthlyAmounts: [
          { month: 1, amount: 10000, auctionAmount: 0 },
          { month: 2, amount: 8200, auctionAmount: 79500 },
          { month: 3, amount: 8400, auctionAmount: 81500 },
          { month: 4, amount: 8600, auctionAmount: 83500 },
          { month: 5, amount: 8800, auctionAmount: 85500 },
          { month: 6, amount: 9000, auctionAmount: 87500 },
          { month: 7, amount: 9250, auctionAmount: 90000 },
          { month: 8, amount: 9500, auctionAmount: 92500 },
          { month: 9, amount: 9750, auctionAmount: 95000 },
          { month: 10, amount: 10000, auctionAmount: 100000 },
        ],
      },
      {
        id: 'SC004',
        name: '₹2,00,000 Chit Scheme',
        amount: 200000,
        duration: 10,
        members: 10,
        monthlyInstallment: 20000,
        commission: 5,
        status: 'Active',
        monthlyAmounts: [
          { month: 1, amount: 20000, auctionAmount: 0 },
          { month: 2, amount: 17000, auctionAmount: 160000 },
          { month: 3, amount: 17000, auctionAmount: 160000 },
          { month: 4, amount: 17200, auctionAmount: 162000 },
          { month: 5, amount: 17400, auctionAmount: 164000 },
          { month: 6, amount: 17600, auctionAmount: 166000 },
          { month: 7, amount: 18000, auctionAmount: 170000 },
          { month: 8, amount: 18000, auctionAmount: 176000 },
          { month: 9, amount: 19200, auctionAmount: 182000 },
          { month: 10, amount: 20000, auctionAmount: 190000 },
        ],
      },
      {
        id: 'SC005',
        name: '₹3,00,000 Chit Scheme',
        amount: 300000,
        duration: 10,
        members: 10,
        monthlyInstallment: 30000,
        commission: 5,
        status: 'Active',
        monthlyAmounts: [
          { month: 1, amount: 30000, auctionAmount: 0 },
          { month: 2, amount: 25500, auctionAmount: 240000 },
          { month: 3, amount: 25500, auctionAmount: 240000 },
          { month: 4, amount: 25800, auctionAmount: 243000 },
          { month: 5, amount: 26100, auctionAmount: 246000 },
          { month: 6, amount: 26400, auctionAmount: 249000 },
          { month: 7, amount: 27000, auctionAmount: 255000 },
          { month: 8, amount: 27900, auctionAmount: 264000 },
          { month: 9, amount: 28800, auctionAmount: 273000 },
          { month: 10, amount: 30000, auctionAmount: 285000 },
        ],
      },
      {
        id: 'SC006',
        name: '₹5,00,000 Chit Scheme',
        amount: 500000,
        duration: 10,
        members: 10,
        monthlyInstallment: 50000,
        commission: 5,
        status: 'Active',
        monthlyAmounts: [
          { month: 1, amount: 50000, auctionAmount: 0 },
          { month: 2, amount: 42500, auctionAmount: 400000 },
          { month: 3, amount: 42500, auctionAmount: 400000 },
          { month: 4, amount: 43000, auctionAmount: 405000 },
          { month: 5, amount: 43500, auctionAmount: 410000 },
          { month: 6, amount: 44000, auctionAmount: 415000 },
          { month: 7, amount: 45000, auctionAmount: 425000 },
          { month: 8, amount: 46500, auctionAmount: 440000 },
          { month: 9, amount: 48000, auctionAmount: 455000 },
          { month: 10, amount: 50000, auctionAmount: 475000 },
        ],
      },
      {
        id: 'SC007',
        name: '₹10,00,000 Chit Scheme',
        amount: 1000000,
        duration: 10,
        members: 10,
        monthlyInstallment: 100000,
        commission: 5,
        status: 'Active',
        monthlyAmounts: [
          { month: 1, amount: 100000, auctionAmount: 0 },
          { month: 2, amount: 85000, auctionAmount: 800000 },
          { month: 3, amount: 85000, auctionAmount: 800000 },
          { month: 4, amount: 86000, auctionAmount: 810000 },
          { month: 5, amount: 87000, auctionAmount: 820000 },
          { month: 6, amount: 88000, auctionAmount: 830000 },
          { month: 7, amount: 90000, auctionAmount: 850000 },
          { month: 8, amount: 93000, auctionAmount: 890000 },
          { month: 9, amount: 96000, auctionAmount: 920000 },
          { month: 10, amount: 100000, auctionAmount: 970000 },
        ],
      },
    ]);
    console.log(`Schemes created: ${schemes.length}`);

    const users = await User.create([
      {
        userId: 'NVS@2026',
        password: 'NVS2026',
        name: 'Super Admin',
        email: 'admin@nvschit.com',
        role: 'super_admin',
        modules: [
          'dashboard', 'members', 'schemes', 'groups', 'collections',
          'billing', 'auctions', 'prizes', 'accounting', 'reports',
          'employees', 'branches', 'notifications', 'settings', 'profile',
          'payments', 'enquiries', 'audit-logs', 'kyc', 'user-management',
          'agents', 'commissions',
        ],
        permissions: ['create', 'edit', 'delete', 'view'],
        status: 'active',
      },
    ]);
    console.log(`Users created: ${users.length}`);

    const branches = await Branch.insertMany([
      {
        id: 'BR001',
        name: 'Madurai HQ',
        address: '1538, North Veli Street, Simmakkal, Madurai – 625001',
        manager: 'Super Admin',
        phone: '960094752',
        groups: 0,
        members: 0,
      },
    ]);
    console.log(`Branches created: ${branches.length}`);



    console.log('');
    console.log('Data seeded successfully');
    console.log(`  Schemes: ${schemes.length}`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Branches: ${branches.length}`);
    console.log(`  Agents: 0`);
    console.log(`  Members: 0`);
    console.log('');
    console.log('Login Credentials:');
    console.log('  Super Admin: NVS@2026 / NVS2026');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
