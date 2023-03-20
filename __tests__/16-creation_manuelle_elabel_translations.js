const webdriver = require('selenium-webdriver');
const remote = require('selenium-webdriver/remote');
const { Builder, Capabilities, By, until } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();
const { faker } = require('@faker-js/faker');

// use it as: await sleep(ms)
const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    ['Chrome', capChrome],
    ['Edge', capEdge],
    ['FireFox', capFirefox],
])(`Création manuelle d\'Elabel pour un Vin:vin et langue:English et gérer les traductions`, (browser, cap) => {
    let driver;

    beforeAll(async () => {
        driver = new Builder()
            .usingServer('http://localhost:4444')
            .withCapabilities(cap)
            .build();
        await driver.get("https://uat.u-label.com/company-account/create-elabel/wine/eu/eng-GB/523/information");
    }, 30000);

    afterAll(async () => {
        await driver.quit();
    }, 200000);

    it(`On ${browser}: login`, async () => {
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

    it(`On ${browser}: product information and then go to translations page`, async () => {
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
            const pdoSymbol0 = await driver.findElement(By.xpath('//*[@id="wizard-h-1"]/div[3]/div[2]/div[1]/label'));
            const color = await driver.findElement(By.id('wine_color'));
            const alcohol = await driver.findElement(By.id('wine_vol_alocol'));
            const harvest = await driver.findElement(By.id('wine_harvest_year'));
            const varieties = await driver.findElement(By.id('wine_varieties'));
            const sugar = await driver.findElement(By.id('wine_sugar_content'));
            const bottler = await driver.findElement(By.id('wine_bottle_type'));
            const bottlerName = await driver.findElement(By.id('wine_bottle'));
            const bottlerAdress = await driver.findElement(By.id('wine_adress_bottle'));
            const importer = await driver.findElement(By.id('wine_importer'));
            const importerAdress = await driver.findElement(By.id('wine_adress_importer'));
            const quantity = await driver.findElement(By.id('wine_quantity'));
            const quantityUnit = await driver.findElement(By.id('wine_unit_quantity'));
            const referringTerms = await driver.findElement(By.id('wine_referring_terms'));
            const traditionalTerms = await driver.findElement(By.id('wine_traditional_termes'));
            const allergens1 = await driver.findElement(By.xpath('//*[@id="wizard-h-1"]/div[18]/div[1]/label'));
            const allergens2 = await driver.findElement(By.xpath('//*[@id="wizard-h-1"]/div[18]/div[2]/label'));

            await pdoName.sendKeys(faker.lorem.word());
            await pdoSymbol0.click();
            await color.sendKeys('640');
            await alcohol.sendKeys('40');
            await harvest.sendKeys('1987');
            await varieties.sendKeys(faker.lorem.word());
            await sugar.sendKeys('570');
            await bottler.sendKeys('889');
            await bottlerName.sendKeys(faker.company.bs());
            await bottlerAdress.sendKeys(faker.address.streetAddress());
            await importer.sendKeys(faker.company.bs());
            await importerAdress.sendKeys(faker.address.streetAddress());
            await quantity.sendKeys('75');
            await quantityUnit.sendKeys('cl');
            await referringTerms.sendKeys('874');
            await traditionalTerms.sendKeys(faker.lorem.word());
            await allergens1.click();
            await allergens2.click();

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
            
            const sucrose = await driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[3]/div/div[2]/div[2]/label'));
            const malicAcid = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[4]/div[1]/div[2]/div[2]/label'));
            const argon = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[4]/div[3]/div[2]/div[3]/label'));
            const eggIysozyme = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[4]/div[4]/div[2]/div[5]/label'));
            const gumArabic = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[5]/div/div[2]/div[2]/label'));
            const milkCasein = await  driver.findElement(By.xpath('//*[@id="popup-wizard"]/div/div/div[6]/div/div[2]/div[2]/label'));

            await sucrose.click();
            await malicAcid.click();
            await argon.click();
            await eggIysozyme.click();
            await gumArabic.click();
            await milkCasein.click();

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

            const nutritionDeclaration = await driver.findElement(By.xpath('//*[@id="wizard-h-3"]/div[2]/label'));
            await driver.wait(until.elementIsVisible(nutritionDeclaration), 10000, 'Timed out after 10 seconds', 2500);
            const wineEnergy = await driver.findElement(By.id('wine_energy'));

            await nutritionDeclaration.click();
            await wineEnergy.sendKeys('78');

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
             * Manage languages
             * 
             */
            const create = await driver.findElement(By.id('preview_wine_edit_languages'));
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

    it(`On ${browser}: choose languages and click next, a translation page editor should render`, async () => {
        try {
         
            const validate = await driver.wait(until.elementLocated(By.id('submit-form')), 10000, 'Timed out after 10 seconds', 2500);
            await driver.wait(until.elementIsVisible(validate), 10000, 'Timed out after 10 seconds', 2500);

            await validate.click();

            const uncheckBtn = await driver.wait(until.elementLocated(By.id('uncheck-all-lang')), 20000, 'Timed out after 20 seconds', 3000);
            await uncheckBtn.click();
            
            const french = await driver.findElement(By.xpath('//*[@id="v-pills-2"]/div/div/form/nav/ul/li[9]/div/label'));
            const spanish = await driver.findElement(By.xpath('//*[@id="v-pills-2"]/div/div/form/nav/ul/li[23]/div/label'));
            const italian = await driver.findElement(By.xpath('//*[@id="v-pills-2"]/div/div/form/nav/ul/li[14]/div/label'));

            await french.click();
            await spanish.click();
            await italian.click();

            const next = await driver.findElement(By.id('elabel_language_create'));
            await next.click();

            const title = await driver.wait(until.elementLocated(By.xpath('//*[@id="step-translation"]/div/div')), 10000, 'Timed out after 10 seconds', 2500);
            const text = await title.getAttribute('innerText');

            expect(text).toContain("Select linguistic versions to compare and validate");
        } catch (err) {
            throw err;
        }
    }, 40000);

    it(`On ${browser}: confirm the translations`, async () => {
        try {
            const next = await driver.wait(until.elementLocated(By.xpath('//*[@id="step-translation"]/form/div[2]/div[3]/button')), 10000, 'Timed out after 10 seconds', 2500);
            await next.click();

            const transAllBtn = await driver.wait(until.elementLocated(By.id('elabel_translator_translate_all')), 10000, 'Timed out after 10 seconds', 2500);
            await driver.wait(until.elementIsVisible(transAllBtn), 10000, 'Timed out after 10 seconds', 2500);

            await transAllBtn.click();

            const button = await driver.wait(until.elementLocated(By.id('elabel_confirmation_confirm')), 15000, 'Timed out after 15 seconds', 3000);

            expect(button).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 40000);

    it(`On ${browser}: QR code generated`, async () => {
        try {
            const transConfirmBtn = await driver.wait(until.elementLocated(By.id('elabel_confirmation_confirm')), 10000, 'Timed out after 10 seconds', 2500);
            await transConfirmBtn.click();

            const button = await driver.wait(until.elementLocated(By.name('download')), 20000, 'Timed out after 20 seconds', 3000);
            await button.click();

            expect(button).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 40000);

});