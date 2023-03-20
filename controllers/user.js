const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('../func/multer');
const sharp = require('../func/sharp');
const { DeleteError, DeleteOld } = require('../func/deleteImages');
const verifyToken = require('../middlewares/auth');
const User = require('../models/user');

const Image = multer('photo', { limits: { fileSize: 50000000 } });

const Err = (res, err) => res.json({ err: err.message });

router.post('/user-create', verifyToken, (req, res) => {
    // get the data from the request
    const {
      username,
      name,
      email,
      roles,
      pw,
    } = req.body;

    if (!username || !name || !email || !roles ||  !pw) {
      return Err(res, { message: 'Required fields: Usename, Name, Role and Password' });
    }

    // if the pw in shorter or longer than it should be, then we end the script
    if (pw.length < 5 || pw.length > 30) return Err(res, { message: 'Password not valid' });

    // add TESTER as default
    if (!roles.includes('TESTER')) roles.push('TESTER');

    // filter only unique values to avoid duplication
    let uniqueRoles = roles.filter((value, index, array) => array.indexOf(value) === index);

    // hash the pw
    bcrypt.hash(pw, 10, async (err, hash) => {
      if (err) return Err(res, err);
      // create a new user with the given data except the pw which need to be hashed before
      const user = new User({
        username,
        name,
        email,
        roles: uniqueRoles,
        pw: hash,
      });

      try {
        const result = await user.save();
        return res.json(null);
      } catch (err) {
        return Err(res, err);
      }

    });

});

router.post('/signin', (req, res) => {
  // get the credentials from the request
  // identifier will starts with the field to use: username, email or phone
  const {
    identifier, pw,
  } = req.body;

  if (!identifier && !pw) return Err(res, { message: 'ERR.a' });

  let query;

  if (identifier.startsWith('username:')) query = { username: identifier.slice(9) };
  else query = { email: identifier.slice(6) };// means identifier = email

  // find the User by query
  User
    .findOne(query, { __v: 0 })
    .then((user) => {
      // if the user isn't found, respond error
      if (!user) return Err(res, { message: 'User not found' });

      const {
        _id, email, pw: PW, ...rest
      } = user._doc;

      // compare the sent pw by the frontend (pw) to the hashed one on the database (user.pw = PW)
      bcrypt.compare(pw, PW)
        .then((resp) => {
          /*
          * If the pw is correct, then we create an authentication token and send it to the
          * user's frontend to be stored and then used on every request to any protected route
          */
          if (resp) {         
            jwt.sign(
              { email, _id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: '180d' }, // days for the token to be expired
              (err, token) => {
                if (token) {
                  res.json({
                    token,
                    user: {
                      _id, ...rest,
                    },
                  });
                } else return Err(res, err);
              },
            );
          } else { // pw doesn't match
            return Err(res, { message: 'Password incorrect' });
          }
        })
        .catch((err) => Err(res, err));
    })
    .catch((err) => Err(res, err));
});

router.post('/user-edit', verifyToken, (req, res) => {
  Image(req, res, (err) => {
    if (err) Err(res, err);

    const { body } = req;
    const { old, username, name } = body;
    const $set = {};
    const $unset = {};
    const { file } = req;
    let photo = '';

    if (name !== undefined && name) $set['name'] = name;
    if (username !== undefined && username) $set['username'] = username;

    if (file) {
      photo = file.filename;
      if (sharp(file.path, photo, [50, 90, 120])) {
        DeleteError([file.path]);
        Err(err, { message: 'ERR.a' });
      } else $set.photo = photo;
    } else if (old) $unset.photo = 1;

    User.updateOne(
      { _id: req.current_user_id},
      { $set, $unset },
      { runValidators: true },
    )
      .then((raw) => {
        if (raw.matchedCount && raw.modifiedCount) {
          if (old) DeleteOld([old], [50, 90, 120, '']);

          return res.json({ photo });
        }

        DeleteError([file.path, `50${file.path}`, `90${file.path}`, `120${file.path}`]);

        Err(res, { message: 'Server error' });
      })
      .catch((err) => {
        DeleteError([file.path, `50${file.path}`, `90${file.path}`, `120${file.path}`]);
        Err(res, err);
      });
  });
});

router.post('/change-email-code', verifyToken, (req, res) => {
  const { email, pw } = req.body;
  const _id = req.current_user_id;
  // const username = req.current_user;

  if (!email || !pw) return Err(res, { message: 'ERROR 1' });

  User.findOne({ _id }, { pw: 1, email: 1, change_email: 1 })
    .then((user) => {
      if (!user) return Err(res, { message: 'User not found' });

      if (user.email === email.trim()) return Err(res, { message: 'Please provide a diffrent e-mail' });

      bcrypt.compare(pw, user.pw)
        .then((resp) => {
          if (!resp) return Err(res, { message: 'Password incorrect' });
          const { change_email } = user;
          let d = '';

          if (change_email.date) {
            // the code is valid for 2 day (48 hours)
            d = change_email.date;
            d.setDate(d.getDate() + 2); // increment the datetime of the change pw request
          }

          if (d && d > new Date()) {
            if (change_email && !change_email.code) return Err(res, { message: 'ERROR 2' });
            // If it has been more than 1 day since the user requested a pw, then we create a new code
            // else, we keep the current and inform the user that he already requested a pw in the last 24 hours
            return Err(res, { message: 'already' });
          }
          // Get a random numeric code of six digits
          const code = Math.floor(Math.random() * (999999 - 100000) + 100000);

          User.updateOne(
            { _id },
            {
              $set: {
                change_email: {
                  email,
                  code,
                  date: new Date(),
                },
              },
            },
            { runValidators: true },
          )
            .then((raw) => {
              if (raw.matchedCount && raw.modifiedCount) {
                // setup email data with unicode symbols
                // const mailOptions = {
                //   from: '"MyApp Admin" <admin@spherevent.com>', // the app admin email address
                //   to: email, // 'spherevent.karabila@gmail.com'
                //   subject: 'E-mail changing.', // change it to a proper subject
                //   html: `Hello <b>${username}</b>, this is the code for your "E-mail changing" process: <b>${code}</b>`, // the html version of the message to be send
                // };
                // send mail with defined transport object
                /* transporter.sendMail(mailOptions, (err)=> {
                    if(err) {
                      res.json({err: 'error sending email'});
                    } else {
                      res.json(null);
                    }
                  }); */
                return res.json(null);
              }
              return Err(res, { message: 'ERROR 3' });
            })
            .catch((err) => Err(res, err));
        })
        .catch((err) => Err(res, err));
    })
    .catch((err) => Err(res, err));
});

router.post('/change-email', verifyToken, (req, res) => {
  const { code } = req.body;
  const _id = req.current_user_id;

  User.findOne({ _id }, { change_email: 1 })
    .then((user) => {
      if (!user) return Err(res, { message: 'ERROR 1' });

      const { change_email } = user;
      // check if there is an email change request
      if (!change_email || Object.keys(change_email) === 0) return Err(res, { message: 'ERROR 2' });

      if (!change_email.code) Err(res, { message: 'ERROR 3' });

      if (change_email.code === parseInt(code, 10)) { // check if the code is correct (parseIn the code to cast it to integer)
        // the code is valid for 2 days (48 hours)
        const d = change_email.date;
        const { email } = change_email;

        d.setDate(d.getDate() + 2);// increment the datetime of the change email request
        // if it has been more than 2 days since the user requested an email change, the we create a new code
        // else, we keep the current and inform the user that he already requested a pw in the last 24 hours
        if (d > new Date()) { // check if the code still valid, means not exceeded 48 hours since it generation
          User.updateOne({ _id }, { $set: { email }, $unset: { 'change_email.code': '' } }, { runValidators: true })
            .then((raw) => {
              if (raw.matchedCount && raw.modifiedCount) return res.json({ email });
              return Err(res, { message: 'ERROR 4' });
            })
            .catch((err) => Err(res, err));
        } else {
          return Err(res, { message: 'ERROR 5' });
        }
      } else {
        return Err(res, { message: 'ERROR 6' });
      }
    })
    .catch((err) => Err(res, err));
});

router.post('/change-pw-code', (req, res) => {
  const { email } = req.body;

  if (!email) return Err(res, { message: 'ERROR 1' });

  User
    .findOne({email}, { username: 1, change_pw: 1 })
    .then((user) => {
      if (!user) return Err(res, { message: 'ERROR 2' });

      const { _id, change_pw } = user;

      let d = '';

      if (change_pw?.date) {
        // the code is valid for 2 days (48 hours)
        d = change_pw.date;
        d.setDate(d.getDate() + 2);// increment the datetime of the change pw request
      }

      if (d && d > new Date()) {
        // if the code doesn't exist means the user has used it in the last 48 hours
        if (change_pw && !change_pw.code) return Err(res, { message: 'ERROR 3' });
        // if it has been more than 2 days since the user requested a pw, then we create a new code
        // else, we keep the current and inform the user that he already requested a pw in the last 24 hours
        return Err(res, { message: 'already' });
      }
      // get a random numeric code of six digits
      const code = Math.floor(Math.random() * (999999 - 100000) + 100000);

      User
        .updateOne(
          { _id },
          {
            $set: {
              change_pw: {
                code, date: new Date(),
              },
            },
          },
          { runValidators: true },
        )
        .then((raw) => {
          if (raw.matchedCount && raw.modifiedCount) {
            
            console.log('mail the code');
            
            // setup email data with unicode symbols
            // let mailOptions= {
            // from: '"MyApp Admin" <admin@spherevent.com>', // the app admin email address
            // to: email,
            // subject: 'Password changing.', // change it to a proper subject
            // text: 'Hello world?', // plain text of the message to send
            // html: 'Hello <b>'+user.username+'</b>, this is the code for your "Password changing" process: <b>'+code+'</b>' // the html version of the message to be send
            // };
            // // send mail with defined transport object
            // transporter.sendMail(mailOptions, (err)=> {
            // if(err) {
            //   res.json({err: err.message});
            // } else {
            //   res.json(null);
            // }
            // });
            return res.json(null);
          }
          return Err(res, { message: 'ERROR 4' });
        })
        .catch((err) => Err(res, err));
    })
    .catch((err) => Err(res, err));
});

router.post('/change-pw', (req, res) => {
  const { email, code, pw } = req.body;

  if (!email || !code || !pw) return Err(res, { message: 'ERROR 1' });

  // validation
  if (pw.length < 8 || pw.length > 30) res.status(400).end();

  User
    .findOne({email}, { username: 1, change_pw: 1 })
    .then((user) => {
      if (!user) Err(res, { message: 'ERR.e' });

      const { _id, username, change_pw } = user;

      // check if there is a pw change request
      if (!change_pw || Object.keys(change_pw).length === 0) Err(res, { message: 'ERR.a' });
      // Check if there is a code in the DB
      if (!change_pw.code) Err(res, { message: 'ERR.ad' });
      // check if the code is correct
      if (change_pw.code === parseInt(code, 10)) {
        // the code is valid for 1 day (24 hours)
        const d = change_pw.date;
        d.setDate(d.getDate() + 1);// increment the datetime of the change pw request to check
        // 24 hours validity
        if (d > new Date()) { // check if the code still valid, means not exceeded 24 hours since
          // it generation
          bcrypt.hash(pw, 10)
            .then((hash) => {
              User.updateOne(
                { _id },
                {
                  $set: {
                    pw: hash,
                  },
                  $unset: {
                    'change_pw.code': '',
                  },
                },
                { runValidators: true },
              )
                .then((raw) => {
                  if (raw.matchedCount && raw.modifiedCount) res.json({ username });
                  else Err(res, { message: 'ERR.a' });
                })
                .catch((err) => Err(res, err));
            })
            .catch((err) => Err(res, err));
        } else {
          Err(res, { message: 'ERR.f' });
        }
      } else {
        Err(res, { message: 'ERR.aa' });
      }
    })
    .catch((err) => Err(res, err));
});


module.exports = router;
