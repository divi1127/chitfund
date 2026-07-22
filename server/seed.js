import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import User from './models/User.js';
import Member from './models/Member.js';
import Agent from './models/Agent.js';
import Scheme from './models/Scheme.js';
import Group from './models/Group.js';
import Collection from './models/Collection.js';
import Auction from './models/Auction.js';
import Employee from './models/Employee.js';
import Branch from './models/Branch.js';
import KYC from './models/KYC.js';
import PlatformSettings from './models/PlatformSettings.js';
import AuditLog from './models/AuditLog.js';
import Notification from './models/Notification.js';
import Commission from './models/Commission.js';

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Member.deleteMany({}),
      Agent.deleteMany({}),
      Scheme.deleteMany({}),
      Group.deleteMany({}),
      Collection.deleteMany({}),
      Auction.deleteMany({}),
      Employee.deleteMany({}),
      Branch.deleteMany({}),
      KYC.deleteMany({}),
      PlatformSettings.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
      Commission.deleteMany({})
    ]);

    console.log(' Cleared existing data');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const subHashedPassword = await bcrypt.hash('sub123', 10);
    const userHashedPassword = await bcrypt.hash('user123', 10);

    const allModules = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "profile", "payments", "enquiries", "audit-logs", "kyc", "user-management", "agents", "commissions"];
    const allPermissions = ["create", "edit", "delete", "view"];

    const users = await User.insertMany([
      { userId: "ADMIN001", password: hashedPassword, name: "Super Admin", email: "admin@nvschit.com", role: "super_admin", modules: allModules, permissions: allPermissions, status: "active" },
      { userId: "SUB001", password: subHashedPassword, name: "Madurai Sub Admin", email: "sub.madurai@nvschit.com", role: "sub_admin", modules: ["dashboard", "members", "schemes", "groups", "collections", "billing", "notifications", "profile", "reports", "kyc", "enquiries", "agents", "commissions"], permissions: ["create", "edit", "view"], status: "active", branch: "Madurai Branch", assignedBranch: "Madurai Branch" },
      { userId: "2026AG01", password: userHashedPassword, name: "Vignesh Chandran", email: "vignesh.c@nvschit.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications", "members", "groups"], permissions: ["view"], status: "active" },
      { userId: "2026AG02", password: userHashedPassword, name: "Divya Natarajan", email: "divya.n@nvschit.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications", "members", "groups"], permissions: ["view"], status: "active" },
      { userId: "2026CM01", password: userHashedPassword, name: "Arjun Krishnamurthy", email: "arjun.k@gmail.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications"], permissions: ["view"], status: "active" },
      { userId: "2026CM02", password: userHashedPassword, name: "Priya Subramaniam", email: "priya.s@gmail.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications"], permissions: ["view"], status: "active" },
    ]);
    console.log(` Users: ${users.length}`);

    const agents = await Agent.insertMany([
      { agentId: "2026AG01", userId: "2026AG01", name: "Vignesh Chandran", phone: "9874563210", email: "vignesh.c@nvschit.com", address: "12, Main Road, Madurai", aadhaar: "XXXX-XXXX-4521", pan: "ABCPK1234D", dob: new Date("1990-05-15"), password: "user123", status: "Active", assignedGroups: ["G001", "G003"], customers: ["2026CM01", "2026CM02"], commissionRate: 1, modules: AGENT_MODULES },
      { agentId: "2026AG02", userId: "2026AG02", name: "Divya Natarajan", phone: "9865432109", email: "divya.n@nvschit.com", address: "45, North Street, Madurai", aadhaar: "XXXX-XXXX-8812", pan: "XYZPS5678F", dob: new Date("1992-08-22"), password: "user123", status: "Active", assignedGroups: ["G002"], customers: [], commissionRate: 1, modules: AGENT_MODULES },
    ]);
    console.log(` Agents: ${agents.length}`);

    const members = await Member.insertMany([
      { id: "M001", memberId: "2026CM01", userId: "2026CM01", name: "Arjun Krishnamurthy", phone: "9876543210", email: "arjun.k@gmail.com", address: "14, Nehru St, Madurai", aadhaar: "XXXX-XXXX-4521", pan: "ABCPK1234D", dob: new Date("1985-03-10"), password: "user123", joined: new Date("2026-01-01"), status: "Active", groups: ["G001"], agentId: "2026AG01", modules: ["dashboard", "profile", "payments", "notifications"], permissions: ["view"] },
      { id: "M002", memberId: "2026CM02", userId: "2026CM02", name: "Priya Subramaniam", phone: "9876501234", email: "priya.s@gmail.com", address: "22, Gandhi Rd, Madurai", aadhaar: "XXXX-XXXX-8812", pan: "XYZPS5678F", dob: new Date("1990-07-25"), password: "user123", joined: new Date("2026-01-01"), status: "Active", groups: ["G001"], agentId: "2026AG01", modules: ["dashboard", "profile", "payments", "notifications"], permissions: ["view"] },
    ]);
    console.log(` Members: ${members.length}`);

    const schemes = await Scheme.insertMany([
      { id: "S001", name: "Basic Chit 25K", amount: 25000, duration: 10, members: 10, monthlyInstallment: 2500, commission: 1, status: "Active" },
      { id: "S002", name: "Silver Chit 50K", amount: 50000, duration: 10, members: 10, monthlyInstallment: 5000, commission: 1, status: "Active" },
      { id: "S003", name: "Gold Chit 1L", amount: 100000, duration: 10, members: 10, monthlyInstallment: 10000, commission: 1, status: "Active" },
      { id: "S004", name: "Platinum Chit 2L", amount: 200000, duration: 10, members: 10, monthlyInstallment: 20000, commission: 1, status: "Active" },
      { id: "S005", name: "Diamond Chit 3L", amount: 300000, duration: 10, members: 10, monthlyInstallment: 30000, commission: 1, status: "Active" },
      { id: "S006", name: "Premium Chit 5L", amount: 500000, duration: 10, members: 10, monthlyInstallment: 50000, commission: 1, status: "Active" },
    ]);
    console.log(` Schemes: ${schemes.length}`);

    const groups = await Group.insertMany([
      { id: "G001", name: "Gold Group A", schemeId: "S003", startDate: new Date("2026-01-01"), status: "Active", currentInstallment: 7, members: ["2026CM01", "2026CM02"], agentId: "2026AG01" },
      { id: "G002", name: "Basic Group B", schemeId: "S001", startDate: new Date("2026-02-01"), status: "Active", currentInstallment: 6, members: [], agentId: "2026AG02" },
    ]);
    console.log(` Groups: ${groups.length}`);

    const collections = await Collection.insertMany([
      { id: "COL001", memberId: "2026CM01", groupId: "G001", amount: 10000, date: new Date("2026-07-01"), installment: 7, mode: "Online", status: "Paid", receiptNo: "RCP2026001", fullInstallmentAmount: 10000, pendingBalance: 0 },
      { id: "COL002", memberId: "2026CM02", groupId: "G001", amount: 7000, date: new Date("2026-07-02"), installment: 7, mode: "Cash", status: "Partially Paid", receiptNo: "RCP2026002", fullInstallmentAmount: 10000, pendingBalance: 3000, partialPayments: [{ amount: 7000, date: new Date("2026-07-02"), mode: "Cash", receiptNo: "RCP2026002-P1" }] },
    ]);
    console.log(` Collections: ${collections.length}`);

    const auctions = await Auction.insertMany([
      { id: "AUC001", groupId: "G001", date: new Date("2026-07-10"), installment: 7, bidAmount: 85000, winnerId: "2026CM01", baseAmount: 100000, dividend: 1500, status: "Completed" },
      { id: "AUC002", groupId: "G002", date: new Date("2026-07-20"), installment: 6, bidAmount: null, winnerId: null, baseAmount: 25000, dividend: null, status: "Scheduled" },
    ]);
    console.log(` Auctions: ${auctions.length}`);

    const employees = await Employee.insertMany([
      { id: "E001", name: "Sundar Rajan", role: "Manager", phone: "9756321098", email: "sundar.r@nvschit.com", branch: "Madurai HQ", status: "Active", groups: ["G001", "G002"] },
    ]);
    console.log(` Employees: ${employees.length}`);

    const branches = await Branch.insertMany([
      { id: "B001", name: "Madurai HQ", address: "1538, North Veli Street, Simmakkal, Madurai – 625001", manager: "Sundar Rajan", phone: "96009 4752", groups: 2, members: 50 },
    ]);
    console.log(` Branches: ${branches.length}`);

    const kycRecords = await KYC.insertMany([
      { memberId: "2026CM01", memberName: "Arjun Krishnamurthy", aadhaarNumber: "1234-5678-9012", panNumber: "ABCPK1234D", status: "approved", reviewedBy: "ADMIN001", reviewedAt: new Date(), submittedAt: new Date(Date.now() - 86400000 * 7) },
      { memberId: "2026CM02", memberName: "Priya Subramaniam", aadhaarNumber: "9876-5432-1098", panNumber: "XYZPS5678F", status: "approved", reviewedBy: "ADMIN001", reviewedAt: new Date(), submittedAt: new Date(Date.now() - 86400000 * 5) },
    ]);
    console.log(` KYC records: ${kycRecords.length}`);

    const notifications = await Notification.insertMany([
      { title: "Welcome to NVS CHIT ENTERPRISES", message: "Your account has been created successfully. Welcome to the platform!", type: "success", recipientType: "all", createdBy: "ADMIN001", createdAt: new Date(Date.now() - 86400000 * 3) },
      { title: "Auction Scheduled", message: "Basic Group B auction scheduled for July 20th at 10:00 AM", type: "info", recipientType: "all", createdBy: "ADMIN001", createdAt: new Date(Date.now() - 86400000 * 2) },
      { title: "Payment Reminder", message: "Monthly installment for July is due by the 5th. Please pay on time.", type: "warning", recipientType: "user", createdBy: "ADMIN001", createdAt: new Date(Date.now() - 86400000) },
    ]);
    console.log(` Notifications: ${notifications.length}`);

    const settings = await PlatformSettings.insertMany([
      { key: "company_name", value: "NVS CHIT ENTERPRISES", description: "Company display name", category: "general" },
      { key: "company_address", value: "1538, North Veli Street, Simmakkal, Madurai – 625001", description: "Company address", category: "general" },
      { key: "company_phone", value: "96009 4752", description: "Company phone number", category: "general" },
      { key: "company_email", value: "nvschit@gmail.com", description: "Company email address", category: "general" },
      { key: "late_fine_percentage", value: 2, description: "Late payment fine percentage per month", category: "penalty" },
      { key: "commission_rate", value: 1, description: "Default commission rate percentage (1% per month)", category: "commission" },
      { key: "max_kyc_days", value: 30, description: "Maximum days allowed for KYC submission", category: "kyc" },
      { key: "payment_grace_days", value: 5, description: "Grace period in days for payments", category: "payment" },
      { key: "agent_max_groups", value: 50, description: "Maximum chit groups per agent", category: "general" },
      { key: "customer_max_schemes", value: 2, description: "Maximum chit schemes per customer", category: "general" },
      { key: "group_members", value: 10, description: "Maximum members per chit group", category: "general" },
      { key: "customers_per_agent", value: 9, description: "Maximum customers per agent", category: "general" },
    ]);
    console.log(` Settings: ${settings.length}`);

    const commissions = await Commission.insertMany([
      { agentId: "2026AG01", agentName: "Vignesh Chandran", groupId: "G001", groupName: "Gold Group A", month: 7, year: 2026, totalCollection: 17000, commissionRate: 1, commissionAmount: 170, status: "Calculated", calculatedAt: new Date() },
    ]);
    console.log(` Commissions: ${commissions.length}`);

    console.log(' ');
    console.log('✅ Data seeded successfully for NVS CHIT ENTERPRISES');
    console.log(`   Users: ${users.length}`);
    console.log(`   Agents: ${agents.length}`);
    console.log(`   Members/Customers: ${members.length}`);
    console.log(`   Schemes: ${schemes.length}`);
    console.log(`   Groups: ${groups.length}`);
    console.log(`   Collections: ${collections.length}`);
    console.log(`   Auctions: ${auctions.length}`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Branches: ${branches.length}`);
    console.log(`   KYC: ${kycRecords.length}`);
    console.log(`   Notifications: ${notifications.length}`);
    console.log(`   Settings: ${settings.length}`);
    console.log(`   Commissions: ${commissions.length}`);
    console.log(' ');
    console.log('🔑 Login Credentials:');
    console.log('   Super Admin: ADMIN001 / admin123');
    console.log('   Sub Admin: SUB001 / sub123');
    console.log('   Agent (Vignesh): 2026AG01 / user123');
    console.log('   Customer (Arjun): 2026CM01 / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

const AGENT_MODULES = ["dashboard", "members", "schemes", "groups", "collections", "profile"];

seedData();
