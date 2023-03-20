const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Get auth header values
  const token = req.headers.jwt;
  // Check if bearer is undefined
  if (!token) return res.json({ err: 'You are not authorized, log in first' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, authData) => {
    if (err) return res.json({ err: err.message });
    req.current_email = authData.email;
    req.current_user_id = authData._id;
  });

  next();
};

module.exports = verifyToken;
