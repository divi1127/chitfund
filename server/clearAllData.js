import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Member from './models/Member.js';
import User from './models/User.js';
import Invoice from './models/Invoice.js';
import Scheme from './models/Scheme.js';
import Group from './models/Group.js';
import Collection from './models/Collection.js';
import Auction from './models/Auction.js';

dotenv.config();

const clearAllData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Delete all data
    const memberCount = await Member.countDocuments();
    const userCount = await User.countDocuments();
    const invoiceCount = await Invoice.countDocuments();
    const schemeCount = await Scheme.countDocuments();
    const groupCount = await Group.countDocuments();
    const collectionCount = await Collection.countDocuments();
    const auctionCount = await Auction.countDocuments();

    console.log('\n=== Current Data Count ===');
    console.log(`Members: ${memberCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Invoices: ${invoiceCount}`);
    console.log(`Schemes: ${schemeCount}`);
    console.log(`Groups: ${groupCount}`);
    console.log(`Collections: ${collectionCount}`);
    console.log(`Auctions: ${auctionCount}`);

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('This action cannot be undone.');
    
    await Member.deleteMany({});
    await User.deleteMany({});
    await Invoice.deleteMany({});
    await Scheme.deleteMany({});
    await Group.deleteMany({});
    await Collection.deleteMany({});
    await Auction.deleteMany({});
    
    console.log('\n✅ All data deleted successfully!');
    console.log('Database is now clean and ready for fresh data.');

    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearAllData();
