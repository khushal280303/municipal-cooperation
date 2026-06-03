const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
