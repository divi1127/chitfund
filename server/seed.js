import mongoose from 'mongoose';
import { connectDB } from './db.js';
import Member from './models/Member.js';
import Scheme from './models/Scheme.js';
import Group from './models/Group.js';
import Collection from './models/Collection.js';
import Auction from './models/Auction.js';
import Employee from './models/Employee.js';
import Branch from './models/Branch.js';

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Member.deleteMany({});
    await Scheme.deleteMany({});
    await Group.deleteMany({});
    await Collection.deleteMany({});
    await Auction.deleteMany({});
    await Employee.deleteMany({});
    await Branch.deleteMany({});
    
    console.log('🗑️ Cleared existing data');

    // Seed Members
    const members = await Member.insertMany([
      { id: "M001", name: "Arjun Krishnamurthy", phone: "9876543210", email: "arjun.k@gmail.com", address: "14, Nehru St, Coimbatore", aadhaar: "XXXX-XXXX-4521", pan: "ABCPK1234D", joined: "2022-01-15", status: "Active", groups: ["G001", "G003"] },
      { id: "M002", name: "Priya Subramaniam", phone: "9876501234", email: "priya.s@gmail.com", address: "22, Gandhi Rd, Madurai", aadhaar: "XXXX-XXXX-8812", pan: "XYZPS5678F", joined: "2021-06-10", status: "Active", groups: ["G001", "G002"] },
      { id: "M003", name: "Rajan Murugavel", phone: "9865432101", email: "rajan.m@yahoo.com", address: "5, Kamarajar St, Salem", aadhaar: "XXXX-XXXX-2290", pan: "LMNRM9012G", joined: "2023-03-20", status: "Active", groups: ["G002"] },
      { id: "M004", name: "Kavitha Selvam", phone: "9845678901", email: "kavitha.s@gmail.com", address: "8, Bharathi Nagar, Trichy", aadhaar: "XXXX-XXXX-6634", pan: "PQRKS3456H", joined: "2020-11-05", status: "Active", groups: ["G003"] },
      { id: "M005", name: "Senthil Kumar", phone: "9756432189", email: "senthil.k@outlook.com", address: "30, Periyar Nagar, Erode", aadhaar: "XXXX-XXXX-9910", pan: "STUSK7890J", joined: "2022-08-12", status: "Inactive", groups: [] },
      { id: "M006", name: "Meenakshi Raman", phone: "9843567890", email: "meenakshi.r@gmail.com", address: "17, Sarojini St, Vellore", aadhaar: "XXXX-XXXX-3312", pan: "UVWMR2345K", joined: "2021-02-28", status: "Active", groups: ["G001"] },
    ]);

    // Seed Schemes
    const schemes = await Scheme.insertMany([
      { id: "S001", name: "Gold Chit – 1 Lakh", amount: 100000, duration: 20, members: 20, monthlyInstallment: 5000, commission: 5, status: "Active" },
      { id: "S002", name: "Silver Chit – 50K", amount: 50000, duration: 25, members: 25, monthlyInstallment: 2000, commission: 5, status: "Active" },
      { id: "S003", name: "Platinum Chit – 2 Lakh", amount: 200000, duration: 20, members: 20, monthlyInstallment: 10000, commission: 5, status: "Active" },
      { id: "S004", name: "Diamond Chit – 5 Lakh", amount: 500000, duration: 25, members: 25, monthlyInstallment: 20000, commission: 5, status: "Closed" },
    ]);

    // Seed Groups
    const groups = await Group.insertMany([
      { id: "G001", name: "Group Alpha", schemeId: "S001", startDate: "2023-01-01", status: "Active", currentInstallment: 14, members: ["M001", "M002", "M006"], agentId: "E001" },
      { id: "G002", name: "Group Beta", schemeId: "S002", startDate: "2022-06-01", status: "Active", currentInstallment: 22, members: ["M002", "M003"], agentId: "E002" },
      { id: "G003", name: "Group Gamma", schemeId: "S003", startDate: "2024-01-01", status: "Active", currentInstallment: 6, members: ["M001", "M004"], agentId: "E001" },
    ]);

    // Seed Collections
    const collections = await Collection.insertMany([
      { id: "COL001", memberId: "M001", groupId: "G001", amount: 5000, date: "2024-06-01", installment: 14, mode: "Online", status: "Paid", receiptNo: "RCP2024001" },
      { id: "COL002", memberId: "M002", groupId: "G001", amount: 5000, date: "2024-06-02", installment: 14, mode: "Cash", status: "Paid", receiptNo: "RCP2024002" },
      { id: "COL003", memberId: "M006", groupId: "G001", amount: 5000, date: "2024-06-05", installment: 14, mode: "Cheque", status: "Paid", receiptNo: "RCP2024003" },
      { id: "COL004", memberId: "M003", groupId: "G002", amount: 2000, date: "2024-06-03", installment: 22, mode: "Online", status: "Paid", receiptNo: "RCP2024004" },
      { id: "COL005", memberId: "M004", groupId: "G003", amount: 10000, date: "2024-06-04", installment: 6, mode: "Cash", status: "Paid", receiptNo: "RCP2024005" },
      { id: "COL006", memberId: "M001", groupId: "G003", amount: 10000, date: "2024-06-01", installment: 6, mode: "Online", status: "Pending", receiptNo: "" },
    ]);

    // Seed Auctions
    const auctions = await Auction.insertMany([
      { id: "AUC001", groupId: "G001", date: "2024-06-10", installment: 14, bidAmount: 85000, winnerId: "M002", baseAmount: 100000, dividend: 750, status: "Completed" },
      { id: "AUC002", groupId: "G002", date: "2024-05-15", installment: 21, bidAmount: 40000, winnerId: "M003", baseAmount: 50000, dividend: 400, status: "Completed" },
      { id: "AUC003", groupId: "G003", date: "2024-06-20", installment: 6, bidAmount: null, winnerId: null, baseAmount: 200000, dividend: null, status: "Scheduled" },
    ]);

    // Seed Employees
    const employees = await Employee.insertMany([
      { id: "E001", name: "Vignesh Chandran", role: "Field Agent", phone: "9874563210", email: "vignesh.c@srilakshmichit.com", branch: "Chennai HQ", status: "Active", groups: ["G001", "G003"] },
      { id: "E002", name: "Divya Natarajan", role: "Collection Agent", phone: "9865432109", email: "divya.n@srilakshmichit.com", branch: "Madurai Branch", status: "Active", groups: ["G002"] },
      { id: "E003", name: "Sundar Rajan", role: "Manager", phone: "9756321098", email: "sundar.r@srilakshmichit.com", branch: "Chennai HQ", status: "Active", groups: [] },
    ]);

    // Seed Branches
    const branches = await Branch.insertMany([
      { id: "B001", name: "Chennai HQ", address: "12, Anna Salai, T. Nagar, Chennai", manager: "Sundar Rajan", phone: "044-28156789", groups: 8, members: 142 },
      { id: "B002", name: "Madurai Branch", address: "5, Meenakshi Nagar, Madurai", manager: "Ramesh Kumar", phone: "0452-2123456", groups: 4, members: 67 },
      { id: "B003", name: "Coimbatore Branch", address: "18, DB Road, Coimbatore", manager: "Pritha Iyer", phone: "0422-4567890", groups: 3, members: 45 },
    ]);

    console.log('✅ Data seeded successfully');
    console.log(`📊 Members: ${members.length}`);
    console.log(`📊 Schemes: ${schemes.length}`);
    console.log(`📊 Groups: ${groups.length}`);
    console.log(`📊 Collections: ${collections.length}`);
    console.log(`📊 Auctions: ${auctions.length}`);
    console.log(`📊 Employees: ${employees.length}`);
    console.log(`📊 Branches: ${branches.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
