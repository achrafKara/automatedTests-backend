const fs = require('fs');

module.exports = {
    DeleteOld: (imgs, sizes) => {
        const Path = `${__dirname}/../images/`;

        imgs.forEach((img) => {
        sizes.forEach((i) => {
            fs.access(Path + i + img, fs.F_OK, (err) => {
            if (err) return console.error('Logs', err.message);

            fs.unlink(Path + i + img, (err) => {
                if (err) return console.error('Logs', err.message);
            });
            });
        });
        });
    },
    DeleteError: (imgs) => imgs.forEach((img) => {
        fs.access(img, fs.F_OK, (err) => {
        if (err) return console.error('Logs', err.message);

        fs.unlink(img, (err) => {
            if (err) return console.error('Logs', err.message);
        });
        });
    }),
};
