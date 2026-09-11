import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
      error: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'fundcamp_super_secret_jwt_key_2026';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, email }

    // Fetch user profile to verify Admin role
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
        error: 'Unauthorized'
      });
    }

    const userType = user.user_type || user.userType;
    if (userType !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. University Administrator privileges required.',
        error: 'Forbidden'
      });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message
    });
  }
};
