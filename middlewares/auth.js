const jwt = require('jsonwebtoken');
const { jwt_secret_key } = require('../config/security');

const verifyToken = (req, res, next) => {
  // Get auth header values
  const token = req.headers.jwt;
  // Check if bearer is undefined
  if (!token) return res.json({ err: 'You are not authorized, log in first' });

  jwt.verify(token, jwt_secret_key, (err, authData) => {
    if (err) return res.json({ err: err.message });
    req.current_user = authData.username;
    req.current_user_id = authData._id;
    req.current_user_role = authData.role;
  });

  next();
};

module.exports = verifyToken;
