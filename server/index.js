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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chit Fund API is running' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
