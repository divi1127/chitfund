import Member from '../models/Member.js';
import Collection from '../models/Collection.js';
import Invoice from '../models/Invoice.js';
import Auction from '../models/Auction.js';
import User from '../models/User.js';

const getYearSuffix = () => String(new Date().getFullYear()).slice(-2);

export const getSchemeAbbreviation = (schemeName) => {
  if (!schemeName) return 'CHT';
  const words = schemeName.trim().split(/\s+/);
  if (words.length >= 3) {
    return words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
  }
  let abbr = schemeName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  if (abbr.length < 3) abbr = abbr.padEnd(3, 'X');
  return abbr;
};

export const generateSchemeMemberId = async (schemeName) => {
  const schemeAbbr = getSchemeAbbreviation(schemeName);
  const year = getYearSuffix();
  const prefix = `${schemeAbbr}-${year}-`;

  const existing = await Member.find({ memberId: new RegExp(`^${prefix}`) })
    .sort({ memberId: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0) {
    const parts = existing[0].memberId.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(2, '0')}`;
  console.log(`✅ ID Gen: Generated scheme member ID - ${newId}`);
  return newId;
};

export const generateMemberPassword = () => {
  const year = getYearSuffix();
  const pw = `HRchit@${year}`;
  console.log(`✅ ID Gen: Generated member password - ${pw}`);
  return pw;
};

export const generateMemberId = async () => {
  const prefix = `HRCHIT${getYearSuffix()}`;
  const existing = await Member.find({ memberId: new RegExp(`^${prefix}`) })
    .sort({ memberId: -1 })
    .limit(1);

  let nextNum = 1;
  if (existing.length > 0) {
    const lastId = existing[0].memberId;
    const num = parseInt(lastId.slice(prefix.length), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  const newId = `${prefix}${String(nextNum).padStart(3, '0')}`;
  console.log(`✅ ID Gen: Generated member ID - ${newId}`);
  return newId;
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
