const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/dotenv');
const { startConnections } = require('../controllers/locationController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/login', (req, res) => {
  const { username, password } = req.body;

 
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});


router.post('/start-connections', authenticateToken, (req, res) => {
  startConnections();
  res.json({ message: 'Connections started.' });
});

module.exports = router;
