const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    required: true
  },
  linkedId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  college_id: {
    type: String,
    default: 'C101'
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash password
UserSchema.statics.hashPassword = async function(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
};

module.exports = mongoose.model('User', UserSchema);
