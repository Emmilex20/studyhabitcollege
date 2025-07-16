// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to protect routes (ensure user is logged in)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // CRITICAL CHECK: Ensure token exists after splitting the header
      if (!token) {
        console.error('AuthMiddleware: Token is missing after "Bearer " split.');
        return res.status(401).json({ message: 'Not authorized, token missing after split' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID and attach to request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      // CRITICAL CHECK: Ensure user exists
      if (!req.user) {
        console.error('AuthMiddleware: User not found for token ID:', decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      // Catch specific JWT errors for clearer messages
      console.error('AuthMiddleware JWT Error:', error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        // This includes 'jwt malformed', 'invalid signature', etc.
        return res.status(401).json({ message: `Not authorized, invalid token: ${error.message}` });
      } else {
        // Generic error during token verification
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
  } else {
    // If no Authorization header or not a Bearer token
    console.error('AuthMiddleware: No Authorization header or malformed Bearer token format.');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware for role-based access control
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure req.user exists before trying to access req.user.role
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route` });
    }
    next();
  };
};

export { protect, authorizeRoles }; 