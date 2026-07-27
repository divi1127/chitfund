import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Member from './models/Member.js';
import Collection from './models/Collection.js';
import Invoice from './models/Invoice.js';
import KYC from './models/KYC.js';
import Auction from './models/Auction.js';
import Commission from './models/Commission.js';

dotenv.config();

const clearOldData = async () => {
  try {
    await connectDB();

    const memberCount = await Member.countDocuments();
    const collectionCount = await Collection.countDocuments();
    const invoiceCount = await Invoice.countDocuments();
    const kycCount = await KYC.countDocuments();
    const auctionCount = await Auction.countDocuments();
    const commissionCount = await Commission.countDocuments();

    console.log('\n=== Current Data Count ===');
    console.log(`Members: ${memberCount}`);
    console.log(`Collections: ${collectionCount}`);
    console.log(`Invoices: ${invoiceCount}`);
    console.log(`KYC: ${kycCount}`);
    console.log(`Auctions: ${auctionCount}`);
    console.log(`Commissions: ${commissionCount}`);

    console.log('\n Deleting member-related data...');

    await Member.deleteMany({});
    await Collection.deleteMany({});
    await Invoice.deleteMany({});
    await KYC.deleteMany({});
    await Auction.deleteMany({});
    await Commission.deleteMany({});

    console.log(' Old members, collections, invoices, KYC cleared.');
    console.log('\n=== Preserved (not deleted) ===');
    console.log('✔ Schemes');
    console.log('✔ Groups');
    console.log('✔ Users & Agents');
    console.log('✔ Branches');
    console.log('\n✅ Done! You can now add fresh members.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearOldData();
