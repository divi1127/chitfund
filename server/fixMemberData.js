import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Member from './models/Member.js';
import User from './models/User.js';

dotenv.config();

const fixMemberData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find the member with email senthill25@gmail.com
    const member = await Member.findOne({ email: 'senthill25@gmail.com' });
    if (!member) {
      console.log('Member not found');
      process.exit(1);
    }

    console.log('Member found:', member.name, member.email);

    // Update member with memberId and userId
    const memberId = 'M102387';
    member.memberId = memberId;
    member.userId = memberId;
    member.password = 'senthil25';
    member.modules = ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'];
    member.permissions = ['view'];
    await member.save();
    console.log('Member updated successfully');
    console.log('Member ID:', member.memberId);

    // Create user entry
    const existingUser = await User.findOne({ userId: memberId });
    if (existingUser) {
      console.log('User already exists');
    } else {
      const userData = {
        userId: memberId,
        name: member.name,
        email: member.email,
        password: 'senthil25',
        role: 'user',
        status: 'active',
        modules: ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'],
        permissions: ['view']
      };

      const newUser = new User(userData);
      await newUser.save();
      console.log('User created successfully');
      console.log('User ID:', newUser.userId);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error fixing member data:', error);
    process.exit(1);
  }
};

fixMemberData();
