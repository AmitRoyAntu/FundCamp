import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, department, userType, avatar, universityId } = req.body;

    // Validation
    if (!name || !email || !password || !department || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Name, email, password, department, and userType are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Password must be at least 8 characters long'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Invalid email address'
      });
    }

    // Check existing user
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: 'Email is already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      userType,
      avatar: avatar || null,
      universityId: universityId || null
    });

    // Generate token
    const secret = process.env.JWT_SECRET || 'fundcamp_super_secret_jwt_key_2026';
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, secret, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          department: newUser.department,
          userType: newUser.user_type || newUser.userType,
          avatar: newUser.avatar,
          universityId: newUser.university_id || newUser.universityId
        }
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Email and password are required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        error: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Login failed',
        error: 'Invalid credentials'
      });
    }

    // Check if account has been deactivated by university administration
    if (user.status === 'deactivated' || user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
        error: 'Your university account has been deactivated by administration. Please contact the administrator.'
      });
    }

    const secret = process.env.JWT_SECRET || 'fundcamp_super_secret_jwt_key_2026';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department,
          userType: user.user_type || user.userType,
          avatar: user.avatar,
          universityId: user.university_id || user.universityId
        }
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
