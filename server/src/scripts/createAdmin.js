// server/src/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zencure');
    
    // Import the User model
    const User = mongoose.models.User || mongoose.model('User', require('../models/User').schema);
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@zencure.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);
    
    const admin = new User({
      name: 'Admin User',
      email: 'admin@zencure.com',
      password: hashedPassword,
      role: 'admin',
      healthProfile: {
        allergies: [],
        conditions: [],
        preferences: []
      },
      reviewIds: [],
      commentIds: [],
      createdAt: new Date()
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();