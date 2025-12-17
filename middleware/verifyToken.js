const jwt = require('jsonwebtoken');
require('../config');
module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[0];
  if (!token) {
    return res.status(401).json({ message: 'UnAuthorized' });
  }

  jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
}
