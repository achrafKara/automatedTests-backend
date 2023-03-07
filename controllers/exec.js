const express = require('express');
const router = express.Router();
const shell = require("shelljs");
const fs = require('fs');
const convert = require('xml-js');

// Test suits
const suits = {
  s1: '1-login_page.js',
  s2: '2-connexion_ko.js',
  s3: '3-connexion_ok.js',
  s4: '4-deconnexion.js',
  s6: '6-inscription_ko.js',
  s7: '7-inscription_ok.js',
  s8: '8-pas_de_souscription.js',
  s10: '10-selection_produit_en_creation_manuelle_elabel.js',
  s11: '11-selection_produit_en_creation_manuelle_elabel_err.js',
  s12: '12-selection_type_source_produit.js',
  s13: '13-identification_produit_validation_champs.js',
  s14: '14-creation_manuelle_elabel.js',
  s15: '15-creation_manuelle_elabel_translations.js'
};

const users = [
  'isabel', 'kim', 'loan', 'mohamed', 'achraf'
];


router.post('/exec', (req, res) => {

  let {suit, user} = req.body;
  let file= suit ? `-- ${suits[suit]}` : '';

  if( !user || !users.includes(user)) return res.sendStatus(500);

  shell.exec(`JEST_JUNIT_OUTPUT_DIR="${process.cwd()}/users/${user}" npm run test ${file}`, 
    function(code, stdout, stderr) {
      const dir = `${process.cwd()}/users/${user}/`;

      const jestReport = fs.readFileSync(`${dir}junit.xml`, { encoding: 'utf8' });

      const QRs = ['Chrome', 'Edge', 'FireFox'].map((browser) => {

        if (!fs.existsSync(`${dir}qr-${browser}.png`)) return null;

        const img = fs.readFileSync(`${dir}qr-${browser}.png`, { encoding: 'base64' });
        
        fs.unlinkSync(`${dir}qr-${browser}.png`);
        return { browser, img }
      })

      const result = convert.xml2json(jestReport, {compact: true, ignoreDeclaration: true});
      const parsedResult = JSON.parse(result)

      fs.unlinkSync(`${dir}junit.xml`);

      res.json({result: parsedResult.testsuites, QRs});
  });
});

module.exports = router;
