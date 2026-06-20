// Company and application constants

export const COMPANY = {
  name: "HR Chits Enterprises",
  address: "12, Anna Salai, T. Nagar, Chennai – 600 017, Tamil Nadu",
  phone: "+91 44 2815 6789",
  email: "info@hrchits.com",
  gstin: "33AABCS1234A1ZQ",
  cin: "U65923TN2001PTC048000",
  logo: "HR",
  website: "www.hrchits.com",
  bankName: "State Bank of India",
  accountName: "HR Chits Enterprises",
  accountNumber: "1234567890",
  ifscCode: "SBIN0001234",
  branch: "Chennai Main Branch",
  upiId: "hrchits@upi",
  googlePay: "hrchits@okhdfcbank",
  phonePe: "hrchits@ybl",
  paytm: "hrchits@paytm",
  bhim: "hrchits@upi",
  cardGateway: "Razorpay",
  merchantId: "rzp_test_12345678",
  apiKey: "rzp_test_abcdef123456",
  cashInstructions: "Please visit our office at 12, Anna Salai, T. Nagar, Chennai. Contact: +91 44 2815 6789. Office hours: 9 AM - 6 PM, Monday - Saturday."
};

// Routes map for URL-based navigation
export const ROUTES = {
  dashboard: "/",
  members: "/members",
  schemes: "/schemes",
  groups: "/groups",
  collections: "/collections",
  billing: "/billing",
  auctions: "/auctions",
  prizes: "/prizes",
  accounting: "/accounting",
  reports: "/reports",
  employees: "/employees",
  branches: "/branches",
  notifications: "/notifications",
  settings: "/settings",
  profile: "/profile",
  payments: "/payments",
  "add-members": "/add-members",
  "user-management": "/user-management",
};

// Reverse map: URL path -> id
export const ROUTE_TO_ID = Object.fromEntries(
  Object.entries(ROUTES).map(([id, path]) => [path, id])
);

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "members", label: "Members", icon: "members" },
  { id: "schemes", label: "Chit Schemes", icon: "schemes" },
  { id: "groups", label: "Groups", icon: "groups" },
  { id: "collections", label: "Collections", icon: "collections" },
  { id: "billing", label: "Billing", icon: "billing" },
  { id: "auctions", label: "Auctions", icon: "auctions" },
  { id: "prizes", label: "Prize Payments", icon: "prizes" },
  { id: "accounting", label: "Accounting", icon: "accounting" },
  { id: "reports", label: "Reports", icon: "reports" },
  { id: "employees", label: "Employees", icon: "employees" },
  { id: "branches", label: "Branches", icon: "branches" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "profile", label: "My Profile", icon: "profile" },
  { id: "payments", label: "My Payments", icon: "payments" },
];
