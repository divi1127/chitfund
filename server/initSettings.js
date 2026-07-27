import mongoose from 'mongoose';
import { connectDB } from './db.js';
import PlatformSettings from './models/PlatformSettings.js';

const initSettings = async () => {
  try {
    await connectDB();
    await PlatformSettings.findOneAndUpdate(
      { key: 'maxPaymentDivisions' },
      { value: 10, description: 'Maximum allowed partial payments per month', category: 'payment' },
      { upsert: true }
    );
    console.log('✅ maxPaymentDivisions initialized to 10');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    process.exit(1);
  }
};

initSettings();
