const multer = require('multer');
const crypto = require('crypto');

function StoreImage(name, opt) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `images/`);
    },
    filename: (req, file, cb) => {
      const ext = file.originalname
        .substring(
          file.originalname.lastIndexOf('.') + 1,
          file.originalname.length,
        );

      crypto.randomBytes(16, (err, raw) => {
        const src = raw.toString('hex') + Date.now();

        cb(null, `${src}.${ext}`);
      });
    },
  });

  return multer({ storage, ...opt }).single(name);
}

module.exports = StoreImage;
