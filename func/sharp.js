const sharp = require('sharp');

const Thumbnails = (img, name, sizes) => {
  let error = false;
  const resize = (size) => sharp(img)
    .resize(size, null, { withoutEnlargement: true })
    .withMetadata()
    .toFile(`images/${size}${name}`)
    .catch((err) => {
      error = true;
      console.log('Logs', err.message);
    });

  sizes.map(resize);

  return error;
};

module.exports = Thumbnails;
