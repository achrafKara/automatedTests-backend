const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('../func/multer');
const sharp = require('../func/sharp');
const { DeleteError } = require('../func/deleteImages');
// const mailer = require('nodemailer');
const { jwt_secret_key } = require('../config/security');
const verifyToken = require('../middlewares/auth');
const User = require('../models/user');
const Follow = require('../models/follow');

const Image = multer('user/', 'photo', { limits: { fileSize: 50000000 } });

const Err = (res, err) => res.json({ err: err.message });

router.post('/user/create', (req, res) => {
    // get the data from the request
    const {
      username,
      name,
      role,
      pw,
    } = req.body;

    if (!username || !name || !role ||  !pw) {
      return Err(res, { message: 'Required fields: Usename, Name, Role and Password' });
    }

    // if the pw in shorter or longer than it should be, then we end the script
    if (pw.length < 8 || pw.length > 30) return Err(res, { message: 'Password not valid' });

    // hash the pw
    bcrypt.hash(pw, 10, (err, hash) => {
      if (err) return Err(res, err);
      // create a new user with the given data except the pw which need to be hashed before
      const user = new User({
        username,
        name,
        email,
        role,
        pw: hash,
      });

      user.save((err) => {
        if (err) return Err(res, err);
        return res.json(null);
      });
    });

});

router.post('/signin', (req, res) => {
  // get the credentials from the request
  // identifier will starts with the field to use: username, email or phone
  const {
    identifier, pw, role
  } = req.body;

  if (!identifier && !pw && !role) return Err(res, { message: 'Required fields' });

  let query;

  if (identifier.startsWith('username:')) query = { username: identifier.slice(9) };
  else if (identifier.startsWith('email:')) query = { email: identifier.slice(6) };
  else query = { phone: identifier.slice(6) }; // means identifier = phone

  // find the User by "username" field,
  User.findOne(query, { __v: 0 })
    .then((user) => {
      // if the user isn't found, respond error
      if (!user) return Err(res, { message: 'User not found' });
      /*
      * we get the stored password ( encrypted) and rename it to "PW" coz we already have
      * another variable declared with the name "pw", and we keep the rest of the user
      * object as "...rest" which is not containing the password as we will send it to
      * the frontend thus we won't send the encrypted password
      */
      const {
        _id, username, pw: PW, ...rest
      } = user._doc;

      // compare the sent pw by the frontend (pw) to the hashed one on the database (user.pw)
      bcrypt.compare(pw, PW)
        .then((resp) => {
          /*
          * If the pw is correct, then we create an authentication token and send it to the
          * user's frontend to be stored and then used on every request to any protected route
          */
          if (resp) {
            jwt.sign(
              { username, _id, role },
              jwt_secret_key,
              { expiresIn: '180d' }, // days for the token to be expired
              (err, token) => {
                if (token) {
                    res.json({
                        token,
                        user: {
                          _id, username, ...rest,
                        },
                    });
                } else return Err(res, err);
              },
            );
          } else { // pw doesn't match
            return Err(res, { message: 'Incorrect password' });
          }
        })
        .catch((err) => Err(res, err));
    })
    .catch((err) => Err(res, err));
});


module.exports = router;
