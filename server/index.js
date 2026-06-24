import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import membersRouter from './routes/members.js';
import schemesRouter from './routes/schemes.js';
import groupsRouter from './routes/groups.js';
import collectionsRouter from './routes/collections.js';
import auctionsRouter from './routes/auctions.js';
import employeesRouter from './routes/employees.js';
import branchesRouter from './routes/branches.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import invoicesRouter from './routes/invoices.js';
import accountingRouter from './routes/accounting.js';
import uploadRouter from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import enquiriesRouter from './routes/enquiries.js';
import auditLogsRouter from './routes/auditLogs.js';
import kycRouter from './routes/kyc.js';
import notificationsRouter from './routes/notifications.js';
import settingsRouter from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    const allowed = process.env.CORS_ORIGIN || 'http://localhost:3001';
    const origins = allowed.split(',').map(s => s.trim().replace(/\/$/, ''));
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (origins.includes(normalizedOrigin) || normalizedOrigin.endsWith('.vercel.app')) {
      callback(null, normalizedOrigin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/members', membersRouter);
app.use('/api/schemes', schemesRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/auctions', auctionsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chit Fund API is running' });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
};

startServer();
