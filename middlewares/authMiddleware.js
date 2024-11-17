const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/dotenv');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) return res.status(401).json({ error: 'Access Denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next(); 
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

module.exports = authenticateToken;