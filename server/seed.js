import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import User from './models/User.js';
import Member from './models/Member.js';
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

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Member.deleteMany({}),
      Scheme.deleteMany({}),
      Group.deleteMany({}),
      Collection.deleteMany({}),
      Auction.deleteMany({}),
      Employee.deleteMany({}),
      Branch.deleteMany({}),
      KYC.deleteMany({}),
      PlatformSettings.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log(' Cleared existing data');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const subHashedPassword = await bcrypt.hash('sub123', 10);
    const userHashedPassword = await bcrypt.hash('user123', 10);

    const allModules = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "profile", "payments", "enquiries", "audit-logs", "kyc", "user-management"];
    const allPermissions = ["create", "edit", "delete", "view"];

    const users = await User.insertMany([
      { userId: "ADMIN001", password: hashedPassword, name: "Super Admin", email: "admin@hrchits.com", role: "super_admin", modules: allModules, permissions: allPermissions, status: "active" },
      { userId: "SUB001", password: subHashedPassword, name: "Chennai Sub Admin", email: "sub.chennai@hrchits.com", role: "sub_admin", modules: ["dashboard", "members", "schemes", "groups", "collections", "billing", "notifications", "profile", "reports", "kyc", "enquiries"], permissions: ["create", "edit", "view"], status: "active", branch: "Chennai HQ", assignedBranch: "Chennai HQ" },
      { userId: "SUB002", password: subHashedPassword, name: "Madurai Sub Admin", email: "sub.madurai@hrchits.com", role: "sub_admin", modules: ["dashboard", "members", "schemes", "groups", "collections", "billing", "notifications", "profile", "reports", "kyc"], permissions: ["create", "edit", "view"], status: "active", branch: "Madurai Branch", assignedBranch: "Madurai Branch" },
      { userId: "USER001", password: userHashedPassword, name: "Arjun Krishnamurthy", email: "arjun.k@gmail.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications", "enquiries"], permissions: ["view"], status: "active" },
      { userId: "USER002", password: userHashedPassword, name: "Priya Subramaniam", email: "priya.s@gmail.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications", "enquiries"], permissions: ["view"], status: "active" },
      { userId: "USER003", password: userHashedPassword, name: "Rajan Murugavel", email: "rajan.m@yahoo.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications", "enquiries"], permissions: ["view"], status: "active" },
      { userId: "USER004", password: userHashedPassword, name: "Kavitha Selvam", email: "kavitha.s@gmail.com", role: "user", modules: ["dashboard", "profile", "payments", "notifications", "enquiries"], permissions: ["view"], status: "active" },
    ]);
    console.log(` Users: ${users.length}`);

    const members = await Member.insertMany([
      { id: "M001", memberId: "M001", userId: "USER001", name: "Arjun Krishnamurthy", phone: "9876543210", email: "arjun.k@gmail.com", address: "14, Nehru St, Coimbatore", aadhaar: "XXXX-XXXX-4521", pan: "ABCPK1234D", password: "user123", joined: "2022-01-15", status: "Active", groups: ["G001", "G003"] },
      { id: "M002", memberId: "M002", userId: "USER002", name: "Priya Subramaniam", phone: "9876501234", email: "priya.s@gmail.com", address: "22, Gandhi Rd, Madurai", aadhaar: "XXXX-XXXX-8812", pan: "XYZPS5678F", password: "user123", joined: "2021-06-10", status: "Active", groups: ["G001", "G002"] },
      { id: "M003", memberId: "M003", userId: "USER003", name: "Rajan Murugavel", phone: "9865432101", email: "rajan.m@yahoo.com", address: "5, Kamarajar St, Salem", aadhaar: "XXXX-XXXX-2290", pan: "LMNRM9012G", password: "user123", joined: "2023-03-20", status: "Active", groups: ["G002"] },
      { id: "M004", memberId: "M004", userId: "USER004", name: "Kavitha Selvam", phone: "9845678901", email: "kavitha.s@gmail.com", address: "8, Bharathi Nagar, Trichy", aadhaar: "XXXX-XXXX-6634", pan: "PQRKS3456H", password: "user123", joined: "2020-11-05", status: "Active", groups: ["G003"] },
      { id: "M005", memberId: "M005", userId: "USER005", name: "Senthil Kumar", phone: "9756432189", email: "senthil.k@outlook.com", address: "30, Periyar Nagar, Erode", aadhaar: "XXXX-XXXX-9910", pan: "STUSK7890J", password: "user123", joined: "2022-08-12", status: "Inactive", groups: [] },
      { id: "M006", memberId: "M006", userId: "USER006", name: "Meenakshi Raman", phone: "9843567890", email: "meenakshi.r@gmail.com", address: "17, Sarojini St, Vellore", aadhaar: "XXXX-XXXX-3312", pan: "UVWMR2345K", password: "user123", joined: "2021-02-28", status: "Active", groups: ["G001"] },
    ]);
    console.log(` Members: ${members.length}`);

    const schemes = await Scheme.insertMany([
      { id: "S001", name: "Gold Chit  1 Lakh", amount: 100000, duration: 20, members: 20, monthlyInstallment: 5000, commission: 5, status: "Active" },
      { id: "S002", name: "Silver Chit  50K", amount: 50000, duration: 25, members: 25, monthlyInstallment: 2000, commission: 5, status: "Active" },
      { id: "S003", name: "Platinum Chit  2 Lakh", amount: 200000, duration: 20, members: 20, monthlyInstallment: 10000, commission: 5, status: "Active" },
      { id: "S004", name: "Diamond Chit  5 Lakh", amount: 500000, duration: 25, members: 25, monthlyInstallment: 20000, commission: 5, status: "Closed" },
    ]);
    console.log(` Schemes: ${schemes.length}`);

    const groups = await Group.insertMany([
      { id: "G001", name: "Group Alpha", schemeId: "S001", startDate: "2023-01-01", status: "Active", currentInstallment: 14, members: ["M001", "M002", "M006"], agentId: "E001" },
      { id: "G002", name: "Group Beta", schemeId: "S002", startDate: "2022-06-01", status: "Active", currentInstallment: 22, members: ["M002", "M003"], agentId: "E002" },
      { id: "G003", name: "Group Gamma", schemeId: "S003", startDate: "2024-01-01", status: "Active", currentInstallment: 6, members: ["M001", "M004"], agentId: "E001" },
    ]);
    console.log(` Groups: ${groups.length}`);

    const collections = await Collection.insertMany([
      { id: "COL001", memberId: "M001", groupId: "G001", amount: 5000, date: "2024-06-01", installment: 14, mode: "Online", status: "Paid", receiptNo: "RCP2024001" },
      { id: "COL002", memberId: "M002", groupId: "G001", amount: 5000, date: "2024-06-02", installment: 14, mode: "Cash", status: "Paid", receiptNo: "RCP2024002" },
      { id: "COL003", memberId: "M006", groupId: "G001", amount: 5000, date: "2024-06-05", installment: 14, mode: "Cheque", status: "Paid", receiptNo: "RCP2024003" },
      { id: "COL004", memberId: "M003", groupId: "G002", amount: 2000, date: "2024-06-03", installment: 22, mode: "Online", status: "Paid", receiptNo: "RCP2024004" },
      { id: "COL005", memberId: "M004", groupId: "G003", amount: 10000, date: "2024-06-04", installment: 6, mode: "Cash", status: "Paid", receiptNo: "RCP2024005" },
      { id: "COL006", memberId: "M001", groupId: "G003", amount: 10000, date: "2024-06-01", installment: 6, mode: "Online", status: "Pending", receiptNo: "" },
    ]);
    console.log(` Collections: ${collections.length}`);

    const auctions = await Auction.insertMany([
      { id: "AUC001", groupId: "G001", date: "2024-06-10", installment: 14, bidAmount: 85000, winnerId: "M002", baseAmount: 100000, dividend: 750, status: "Completed" },
      { id: "AUC002", groupId: "G002", date: "2024-05-15", installment: 21, bidAmount: 40000, winnerId: "M003", baseAmount: 50000, dividend: 400, status: "Completed" },
      { id: "AUC003", groupId: "G003", date: "2024-06-20", installment: 6, bidAmount: null, winnerId: null, baseAmount: 200000, dividend: null, status: "Scheduled" },
    ]);
    console.log(` Auctions: ${auctions.length}`);

    const employees = await Employee.insertMany([
      { id: "E001", name: "Vignesh Chandran", role: "Field Agent", phone: "9874563210", email: "vignesh.c@hrchits.com", branch: "Chennai HQ", status: "Active", groups: ["G001", "G003"] },
      { id: "E002", name: "Divya Natarajan", role: "Collection Agent", phone: "9865432109", email: "divya.n@hrchits.com", branch: "Madurai Branch", status: "Active", groups: ["G002"] },
      { id: "E003", name: "Sundar Rajan", role: "Manager", phone: "9756321098", email: "sundar.r@hrchits.com", branch: "Chennai HQ", status: "Active", groups: [] },
    ]);
    console.log(` Employees: ${employees.length}`);

    const branches = await Branch.insertMany([
      { id: "B001", name: "Chennai HQ", address: "12, Anna Salai, T. Nagar, Chennai", manager: "Sundar Rajan", phone: "044-28156789", groups: 8, members: 142 },
      { id: "B002", name: "Madurai Branch", address: "5, Meenakshi Nagar, Madurai", manager: "Ramesh Kumar", phone: "0452-2123456", groups: 4, members: 67 },
      { id: "B003", name: "Coimbatore Branch", address: "18, DB Road, Coimbatore", manager: "Pritha Iyer", phone: "0422-4567890", groups: 3, members: 45 },
    ]);
    console.log(` Branches: ${branches.length}`);

    const kycRecords = await KYC.insertMany([
      { memberId: "MEM-KYC-001", memberName: "Arjun Krishnamurthy", aadhaarNumber: "1234-5678-9012", panNumber: "ABCPK1234D", status: "approved", reviewedBy: "ADMIN001", reviewedAt: new Date(), submittedAt: new Date(Date.now() - 86400000 * 7) },
      { memberId: "MEM-KYC-002", memberName: "New Member", aadhaarNumber: "9876-5432-1098", panNumber: "NEWPK5678E", status: "pending", submittedAt: new Date(Date.now() - 86400000) },
      { memberId: "MEM-KYC-003", memberName: "Pending User", aadhaarNumber: "4567-8901-2345", panNumber: "PENPK9012F", status: "pending", submittedAt: new Date() },
    ]);
    console.log(` KYC records: ${kycRecords.length}`);

    const notifications = await Notification.insertMany([
      { title: "Welcome to HR Chits", message: "Your account has been created successfully. Welcome to the platform!", type: "success", recipientType: "all", createdBy: "ADMIN001", createdAt: new Date(Date.now() - 86400000 * 3) },
      { title: "Auction Scheduled", message: "Group Gamma auction scheduled for June 20th at 10:00 AM", type: "info", recipientType: "all", createdBy: "ADMIN001", createdAt: new Date(Date.now() - 86400000 * 2) },
      { title: "Payment Reminder", message: "Monthly installment for June is due by the 5th. Please pay on time.", type: "warning", recipientType: "user", createdBy: "ADMIN001", createdAt: new Date(Date.now() - 86400000) },
      { title: "KYC Approval Needed", message: "New KYC documents are pending review. Please check and approve.", type: "info", recipientType: "super_admin", recipientIds: ["ADMIN001"], createdBy: "SYSTEM", createdAt: new Date() },
    ]);
    console.log(` Notifications: ${notifications.length}`);

    const settings = await PlatformSettings.insertMany([
      { key: "company_name", value: "HR Chits Enterprises", description: "Company display name", category: "general" },
      { key: "company_address", value: "12, Anna Salai, T. Nagar, Chennai  600 017, Tamil Nadu", description: "Company address", category: "general" },
      { key: "company_phone", value: "+91 44 2815 6789", description: "Company phone number", category: "general" },
      { key: "company_email", value: "info@hrchits.com", description: "Company email address", category: "general" },
      { key: "late_fine_percentage", value: 2, description: "Late payment fine percentage per month", category: "penalty" },
      { key: "commission_rate", value: 5, description: "Default commission rate percentage", category: "commission" },
      { key: "max_kyc_days", value: 30, description: "Maximum days allowed for KYC submission", category: "kyc" },
      { key: "payment_grace_days", value: 5, description: "Grace period in days for payments", category: "payment" },
    ]);
    console.log(` Settings: ${settings.length}`);

    console.log(' Data seeded successfully');
    console.log(` Users: ${users.length}`);
    console.log(` Members: ${members.length}`);
    console.log(` Schemes: ${schemes.length}`);
    console.log(` Groups: ${groups.length}`);
    console.log(` Collections: ${collections.length}`);
    console.log(` Auctions: ${auctions.length}`);
    console.log(` Employees: ${employees.length}`);
    console.log(` Branches: ${branches.length}`);
    console.log(` KYC: ${kycRecords.length}`);
    console.log(` Notifications: ${notifications.length}`);
    console.log(` Settings: ${settings.length}`);

    process.exit(0);
  } catch (error) {
    console.error(' Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
