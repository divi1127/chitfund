import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plainPassword: { type: String, default: '' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['super_admin', 'sub_admin', 'user'],
    default: 'user'
  },
  modules: [{ type: String }],
  permissions: [{ type: String }],
  mustChangePassword: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`✅ User: Password hashed for ${this.userId}`);
    next();
  } catch (error) {
    console.error(`❌ User: Error hashing password for ${this.userId}:`, error.message);
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`✅ User: Password comparison for ${this.userId}: ${isMatch ? 'MATCH' : 'MISMATCH'}`);
    return isMatch;
  } catch (error) {
    console.error(`❌ User: Error comparing password for ${this.userId}:`, error.message);
    return false;
  }
};

export default mongoose.model('User', userSchema);
