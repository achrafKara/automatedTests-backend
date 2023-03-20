const express = require('express');
const router = express.Router();
const shell = require("shelljs");
const fs = require('fs');
const convert = require('xml-js');

// Test suits
const suits = {
  1: '1-sign_in_page.js',
  2: '2-sign_in_ko.js',
  3: '3-sign_in_ok.js',
  4: '4-sign_out.js',
  6: '6-sign_up_ko.js',
  7: '7-sign_up_ok.js',
  8: '8-create_elabel_without_having_package.js',
  10: '10-create_elabel_product_page.js',
  11: '11-create_elabel_product_empty_form.js',
  12: '12-create_elabel_product_wine-manually.js',
  13: '13-information_product_validations.js',
  14: '14-create_elabel_manually_wine-wine_english.js',
  15: '15-create_elabel_manually_spirit-vodka_english.js',
  16: '16-creation_manuelle_elabel_translations.js'
};

const users = [
  'isabel', 'kim', 'loan', 'mohamed', 'achraf'
];

router.post('/exec', (req, res) => {

  let {suit, user} = req.body;
  let file= suit ? `-- ${suits[suit]}` : '';
  const dir= `${__dirname}/../temp/`;
  const outputName = `${user}.xml`;

  if( !user || !suit) return res.sendStatus(500);

  shell.exec(`JEST_JUNIT_OUTPUT_DIR="${dir}" JEST_JUNIT_OUTPUT_NAME="${outputName}" USER_NAME="${user}" npm run test ${file}`, 
    function(code, stdout, stderr) {

      let QRs = null;

      const jestReport = fs.readFileSync(`${dir}${outputName}`, { encoding: 'utf8' });

      if (suit === '14' || suit === '15') {

        QRs = ['Chrome', 'Edge', 'FireFox'].map((browser) => {

          const path = `${dir}qr-${browser}-${user}.png`;

          if (!fs.existsSync(path)) return null;

          const img = fs.readFileSync(path, { encoding: 'base64' });
          
          fs.unlinkSync(path);
          return { browser, img }
        })
      };
      
      const result = convert.xml2json(jestReport, {compact: true, ignoreDeclaration: true});
      const parsedResult = JSON.parse(result)

      fs.unlinkSync(`${dir}${outputName}`);

      res.json({result: parsedResult.testsuites, QRs});
  });
});

module.exports = router;
