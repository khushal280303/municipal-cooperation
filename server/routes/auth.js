const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send OTP (mock - replace with actual SMS service)
const sendOTP = async (phone, otp) => {
  console.log(`OTP for ${phone}: ${otp}`);
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
  // For testing, we just log it
  return true;
};

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit phone number' });
    }

    // Check if phone already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.findOneAndDelete({ phone }); // Delete existing OTP
    
    const otpDoc = new OTP({ phone, otp });
    await otpDoc.save();

    // Send OTP via SMS
    await sendOTP(phone, otp);

    res.json({ message: 'OTP sent successfully', phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const otpDoc = await OTP.findOne({ phone });
    if (!otpDoc) {
      return res.status(400).json({ error: 'OTP expired or not found' });
    }

    if (otpDoc.attempts >= 3) {
      await OTP.findByIdAndDelete(otpDoc._id);
      return res.status(400).json({ error: 'Too many attempts. Please request a new OTP' });
    }

    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpDoc.verified = true;
    await otpDoc.save();

    res.json({ message: 'OTP verified successfully', phone, verified: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register with OTP verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, department, designation } = req.body;

    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone are required' });
    }

    // Verify OTP was verified
    const otpDoc = await OTP.findOne({ phone, verified: true });
    if (!otpDoc) {
      return res.status(400).json({ error: 'Please verify OTP first' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone already registered' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      address,
      department,
      designation,
      phoneVerified: true,
      role: 'citizen'
    });

    await user.save();
    await OTP.findByIdAndDelete(otpDoc._id); // Delete OTP after registration

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login with OTP (optional - alternative login method)
router.post('/login-otp/send', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit phone number' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: 'User not found with this phone number' });
    }

    const otp = generateOTP();
    await OTP.findOneAndDelete({ phone });
    
    const otpDoc = new OTP({ phone, otp });
    await otpDoc.save();

    await sendOTP(phone, otp);

    res.json({ message: 'OTP sent to registered phone', phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login with OTP verification
router.post('/login-otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const otpDoc = await OTP.findOne({ phone });
    if (!otpDoc || otpDoc.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await OTP.findByIdAndDelete(otpDoc._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Traditional email/password login (keeping existing functionality)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
