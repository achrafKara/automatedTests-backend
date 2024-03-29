const webdriver = require('selenium-webdriver');
const remote = require('selenium-webdriver/remote');
const { Builder, Capabilities, By, until, Select } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();
let fs = require('fs');
const { faker } = require('@faker-js/faker');

// use it as: await sleep(ms)
const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    // ['Chrome', capChrome],
    ['Edge', capEdge],
    // ['FireFox', capFirefox],
])(`Create an e-label manually: type "Spirit" category "Vodka" and langue "English"`, (browser, cap) => {
    let driver;

    beforeAll(async () => {
        driver = new Builder()
            .usingServer('http://localhost:4444')
            .withCapabilities(cap)
            .build();
        await driver.get("https://uat.u-label.com/company-account/create-elabel/spirit/eu/eng-GB/698/information");
    }, 30000);

    afterAll(async () => {
        await driver.quit();
    }, 130000);

    it(`On ${browser}: Login`, async () => {
        try {
            const usernameInput = await driver.findElement(By.name('_username'));
            const passwordInput = await driver.findElement(By.name('_password'));
            const submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Ash Raf');
            await passwordInput.sendKeys('PASSword$123');
            await submitButton.click();

            const form = await driver.wait(until.elementLocated(By.name('wine')), 10000, 'Timed out after 30 seconds', 5000);

            expect(form).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: Create in all languages`, async () => {
        try {
            await driver.setFileDetector(new remote.FileDetector); 

            /**
             * 
             * 1- Product identification
             * 
             */

            const reference = await driver.findElement(By.id('wine_reference_qr'));
            const gtin = await driver.findElement(By.id('wine_gtin_number'));
            const name = await driver.findElement(By.id('wine_name'));
            const internalName = await driver.findElement(By.id('wine_internal_name'));
            const company = await driver.findElement(By.id('wine_company_name'));
            const image = await driver.findElement(By.id('wine_image'));
            const countrySelect = await driver.findElement(By.id('wine_country'));
            const country = new Select(countrySelect);
            const category = await driver.findElement(By.id('wine_category'));

            await driver.executeScript("arguments[0].style.display='block';", image);

            await reference.sendKeys(`T${Math.floor(Date.now() / 1000)}`);
            await gtin.sendKeys(faker.random.numeric(14));
            await name.sendKeys(`${faker.lorem.word()}-${browser}`);
            await internalName.sendKeys(faker.lorem.word());
            await company.sendKeys(faker.company.bs());
            await country.selectByValue('FR'),
            await category.sendKeys('523');
            // Upload the product image
            await image.sendKeys(process.cwd()+'/files/b1.jpeg');

            /**
             * 
             * 2- Product characteristics
             * 
             */

            const pdoName = await driver.findElement(By.id('wine_pdo_name'));
            const pdoSymbol = await driver.findElement(By.xpath('//*[@id="wizard-h-1"]/div[3]/div[2]/div[1]/label'));
            const alcohol = await driver.findElement(By.id('wine_vol_alocol'));
            const harvest = await driver.findElement(By.id('wine_harvest_year'));
            const aging = await driver.findElement(By.id('wine_ageing'));
            const bottler = await driver.findElement(By.id('wine_bottle_type'));
            const bottlerName = await driver.findElement(By.id('wine_bottle'));
            const bottlerAdress = await driver.findElement(By.id('wine_adress_bottle'));
            const importer = await driver.findElement(By.id('wine_importer'));
            const importerAdress = await driver.findElement(By.id('wine_adress_importer'));
            const quantity = await driver.findElement(By.id('wine_quantity'));
            const quantityUnit = await driver.findElement(By.id('wine_unit_quantity'));

            await pdoName.sendKeys(faker.lorem.word());
            await pdoSymbol.click();
            await alcohol.sendKeys('40');
            await harvest.sendKeys('1987');
            await aging.sendKeys('barrels');
            await bottler.sendKeys('889');
            await bottlerName.sendKeys(faker.company.bs());
            await bottlerAdress.sendKeys(faker.address.streetAddress());
            await importer.sendKeys(faker.company.bs());
            await importerAdress.sendKeys(faker.address.streetAddress());
            await quantity.sendKeys('75');
            await quantityUnit.sendKeys('cl');

            /**
             * 
             * 3- Ingredients
             * 
             */

            // Add ingredient wizard (Pop up)
            const ingredientsWizard = await driver.findElement(By.xpath('//*[@id="wizard-h-2"]/div[2]/label[2]'));
            await ingredientsWizard.click();

            const ingredientsWizardBtn = await driver.findElement(By.id('btn-confirm-wizard'));
            await driver.wait(until.elementIsVisible(ingredientsWizardBtn), 10000, 'Timed out after 10 seconds', 2500);
            
            const potato = await driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[3]/div/div[2]/div[1]/label'));
            const cereal = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[3]/div/div[2]/div[2]/label'));
            const grain = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[3]/div/div[2]/div[3]/label'));
            const wine = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[3]/div/div[2]/div[4]/label'));
            const glucose = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[4]/div/div[2]/div/label'));
            const flavouring = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[5]/div/div[2]/div[1]/label'));

            await potato.click();
            await cereal.click();
            await grain.click();
            await wine.click();
            await glucose.click();
            await flavouring.click();

            await ingredientsWizardBtn.click();
            await driver.wait(until.elementIsNotVisible(ingredientsWizardBtn), 10000, 'Timed out after 10 seconds', 2500);

            // Add ingredient manually (Pop up)
            const ingredientsManual = await driver.findElement(By.xpath('//*[@id="wizard-h-2"]/div[2]/label[1]'));
            await ingredientsManual.click();

            const ingredientsManualBtnConfirm = await driver.findElement(By.id('btn-confirm-editor'));
            await driver.wait(until.elementIsVisible(ingredientsManualBtnConfirm), 10000, 'Timed out after 10 seconds', 2500);

            const ingredientsText = await driver.findElement(By.xpath('//*[@id="popup-editor-ing"]/div/div/div[2]/div/div/div/textarea'));
            await ingredientsText.sendKeys('grape, grape must, acidity regulator(calcium sulphate), antioxidant(carbon dioxide)');
            await ingredientsManualBtnConfirm.click();
            await driver.wait(until.elementIsNotVisible(ingredientsManualBtnConfirm), 10000, 'Timed out after 10 seconds', 2500);


            /**
             * 
             * 4- Nutrition declaration
             * 
             */

            const energyValueManual = await driver.findElement(By.xpath('//*[@id="energy-100"]/div[1]/div[2]/label'));
            const wineEnergy = await driver.findElement(By.id('wine_energy'));
            const winePortion = await driver.findElement(By.id('wine_portion'));
            const winePortionNbr = await driver.findElement(By.id('wine_nbportion'));

            const nutritionDeclarationCheck = await driver.findElement(By.xpath('//*[@id="wizard-h-3"]/div[6]/label'));
            await nutritionDeclarationCheck.click();

            const nutritionDeclaration = await driver.wait(until.elementLocated(By.id('full-nut')), 10000, 'Timed out after 30 seconds', 5000);
            await driver.wait(until.elementIsVisible(nutritionDeclaration), 10000, 'Timed out after 10 seconds', 2500);

            const fat = await driver.findElement(By.id('wine_fat'));
            const fatSaturates = await driver.findElement(By.id('wine_fat_saturates'));
            const carbo = await driver.findElement(By.id('wine_carbo'));
            const carboSugar = await driver.findElement(By.id('wine_carbo_sugar'));
            const protein = await driver.findElement(By.id('wine_protein'));
            const salt = await driver.findElement(By.id('wine_salt'));

            await energyValueManual.click();
            await wineEnergy.sendKeys('100');
            await winePortion.sendKeys('100');
            await winePortionNbr.sendKeys('5');

            await fat.sendKeys('10');
            await fatSaturates.sendKeys('5');
            await carbo.sendKeys('5');
            await carboSugar.sendKeys('5');
            await protein.sendKeys('5');
            await salt.sendKeys('5');

            /**
             * 
             * 5- Responsible consumption
             * 
             */

            const messageRisk = await driver.findElement(By.xpath('//*[@id="wizard-h-4"]/div[5]/div[1]/label'));
            await messageRisk.click();

            /**
             * 
             * 6- Sustainability
             * 
             */

            const sustainabilityPicto1 = await driver.findElement(By.xpath('//*[@id="wizard-h-5"]/div[3]/div[1]/label'));
            const sustainabilityMsg = await driver.findElement(By.id('wine_sustainability_message'));
            const sustainabilityImage = await driver.findElement(By.id('wine_company_image'));

            await driver.executeScript("arguments[0].style.display='block';", sustainabilityImage);

            await sustainabilityPicto1.click();
            await sustainabilityMsg.sendKeys(faker.lorem.sentence(6))
            await sustainabilityImage.sendKeys(process.cwd()+'/files/picto.jpeg');

            /**
             * 
             * 7- About the company
             * 
             */

            const companyImage = await driver.findElement(By.id('wine_company_image'));
            const link = await driver.findElement(By.id('wine_company_website'));

            await driver.executeScript("arguments[0].style.display='block';", companyImage);

            await link.sendKeys(faker.internet.url());
            // Upload the company image
            await companyImage.sendKeys(process.cwd()+'/files/logo.jpeg');


            /**
             * 
             * Create in all languages
             * 
             */
            const create = await driver.findElement(By.id('preview_wine_create'));
            await create.click();

            /**
             * 
             * Preview pop up
             * 
             */
            const validate = await driver.wait(until.elementLocated(By.id('submit-form')), 10000, 'Timed out after 10 seconds', 2500);
            await driver.wait(until.elementIsVisible(validate), 10000, 'Timed out after 10 seconds', 2500);

            const text = await validate.getAttribute("innerText");

            expect(text).toEqual("Validate");
        } catch (err) {
            throw err;
        }
    }, 45000);

    // it(`On ${browser}: Validate information`, async () => {
    //     try {
    //         await driver.setFileDetector(new remote.FileDetector);

    //         const validate = await driver.wait(until.elementLocated(By.id('submit-form')), 10000, 'Timed out after 10 seconds', 2500);
    //         await driver.wait(until.elementIsVisible(validate), 10000, 'Timed out after 10 seconds', 2500);

    //         await validate.click();

    //         // Returns base64 encoded string
    //         const scrollTo = await driver.wait(until.elementLocated(By.xpath('//*[@id="form_qrcode"]/div[3]')), 20000, 'Timed out after 20 seconds', 3000);
    //         await driver.actions().scroll(0, 0, 0, 0, scrollTo).perform();
    //         // await driver.wait(until.elementIsVisible(scrollTo), 10000, 'Timed out after 10 seconds', 2500);

    //         const qrImage = await driver.wait(until.elementLocated(By.xpath('//*[@id="form_qrcode"]/div[2]/div/label[2]/div/img')), 10000, 'Timed out after 10 seconds', 2500);
    //         await driver.wait(until.elementIsVisible(qrImage), 10000, 'Timed out after 10 seconds', 2500);
    //         const encodedString = await qrImage.takeScreenshot(true);

    //         fs.writeFileSync(`${process.env.JEST_JUNIT_OUTPUT_DIR}/qr-${browser}.png`, encodedString, 'base64');

    //         const button = await driver.wait(until.elementLocated(By.name('view')), 10000, 'Timed out after 20 seconds', 2500);
    //         await button.click();

    //         expect(button).toBeTruthy();
    //     } catch (err) {
    //         throw err;
    //     }
    // }, 60000);

});