import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Member from './models/Member.js';
import User from './models/User.js';

dotenv.config();

const createUserForMember = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find member by memberId
    const member = await Member.findOne({ memberId: 'M102387' });
    if (!member) {
      console.log('Member not found');
      process.exit(1);
    }

    console.log('Member found:', member.memberId, member.name);

    // Check if user already exists
    const existingUser = await User.findOne({ userId: member.memberId });
    if (existingUser) {
      console.log('User already exists for this member');
      process.exit(0);
    }

    // Create user entry
    const userData = {
      userId: member.memberId,
      name: member.name,
      email: member.email,
      password: member.password,
      role: 'user',
      status: 'active',
      modules: member.modules || ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'],
      permissions: member.permissions || ['view']
    };

    const newUser = new User(userData);
    await newUser.save();
    console.log('User created successfully');
    console.log('User ID:', newUser.userId);
    console.log('Name:', newUser.name);
    console.log('Email:', newUser.email);
    console.log('Role:', newUser.role);

    process.exit(0);
  } catch (error) {
    console.error('Error creating user for member:', error);
    process.exit(1);
  }
};

createUserForMember();
