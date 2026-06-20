import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Member from './models/Member.js';

dotenv.config();

const listMembers = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const members = await Member.find({});
    console.log('Total members:', members.length);
    
    members.forEach(member => {
      console.log('Member ID:', member.memberId);
      console.log('Name:', member.name);
      console.log('Email:', member.email);
      console.log('Password:', member.password);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error listing members:', error);
    process.exit(1);
  }
};

listMembers();
