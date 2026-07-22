import Member from '../models/Member.js';
import Agent from '../models/Agent.js';
import Collection from '../models/Collection.js';
import Invoice from '../models/Invoice.js';
import Auction from '../models/Auction.js';
import User from '../models/User.js';

const getYearPrefix = () => String(new Date().getFullYear());

export const generateAgentId = async () => {
  const year = getYearPrefix();
  const prefix = `${year}AG`;
  const existing = await Agent.find({ agentId: new RegExp(`^${prefix}`) })
    .sort({ agentId: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0) {
    const num = parseInt(existing[0].agentId.slice(prefix.length), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(2, '0')}`;
  return newId;
};

export const generateCustomerId = async () => {
  const year = getYearPrefix();
  const prefix = `${year}CM`;
  const existing = await Member.find({ memberId: new RegExp(`^${prefix}`) })
    .sort({ memberId: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0) {
    const num = parseInt(existing[0].memberId.slice(prefix.length), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(2, '0')}`;
  return newId;
};

export const generatePasswordFromDob = (dob) => {
  if (!dob) return 'welcome@2026';
  const d = new Date(dob);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
};

export const generateSchemeMemberId = async (schemeName) => {
  const year = getYearPrefix().slice(-2);
  const prefix = `NVS${year}`;
  const existing = await Member.find({ memberId: new RegExp(`^${prefix}`) })
    .sort({ memberId: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0) {
    const num = parseInt(existing[0].memberId.slice(prefix.length), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(3, '0')}`;
  return newId;
};

export const generateMemberPassword = () => {
  const pw = 'welcome@2026';
  return pw;
};

export const generateReceiptNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `RCP${year}`;
  const existing = await Collection.find({ receiptNo: new RegExp(`^${prefix}`) })
    .sort({ receiptNo: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0 && existing[0].receiptNo) {
    const num = parseInt(existing[0].receiptNo.slice(prefix.length), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(3, '0')}`;
  console.log(`✅ ID Gen: Generated receipt no - ${newId}`);
  return newId;
};

export const generateInvoiceNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV${year}`;
  const existing = await Invoice.find({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0 && existing[0].invoiceNumber) {
    const num = parseInt(existing[0].invoiceNumber.slice(prefix.length), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(3, '0')}`;
  console.log(`✅ ID Gen: Generated invoice no - ${newId}`);
  return newId;
};

export const generateAuctionConductId = async () => {
  const year = new Date().getFullYear();
  const prefix = `AVC${year}`;
  const existing = await Auction.find({ id: new RegExp(`^${prefix}`) })
    .sort({ id: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0 && existing[0].id) {
    const num = parseInt(existing[0].id.slice(prefix.length), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(3, '0')}`;
  console.log(`✅ ID Gen: Generated auction conduct ID - ${newId}`);
  return newId;
};
