const webdriver = require('selenium-webdriver');
const { Builder, Capabilities, By, until, javasc } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();

// use it as: await sleep(ms)
const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    ['Chrome', capChrome],
    ['Edge', capEdge],
    ['FireFox', capFirefox],
])(`Information about the product: validations`, (browser, cap) => {
    let driver;

    beforeAll(async () => {
        driver = new Builder()
            .usingServer('http://localhost:4444')
            .withCapabilities(cap)
            .build();
        await driver.get("https://uat.u-label.com/company-account/create-elabel/wine/eu/eng-GB/524/information");
    }, 30000);

    afterAll(async () => {
        await driver.quit();
    }, 100000);

    it(`On ${browser}: Login`, async () => {
        try {
            const usernameInput = await driver.findElement(By.name('_username'));
            const passwordInput = await driver.findElement(By.name('_password'));
            const submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Ash Raf');
            await passwordInput.sendKeys('PASSword$123');
            await submitButton.click();

            const form = await driver.wait(until.elementLocated(By.name('wine')), 10000, 'Timed out after 10 seconds', 2500);

            expect(form).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 45000);
    
    it(`On ${browser}: Create with an empty form, preview pop up will render`, async () => {
        try {
            const create = await driver.wait(until.elementLocated(By.id('preview_wine_create')), 10000, 'Timed out after 10 seconds', 2500);
            await create.click();

            const popup = await driver.wait(until.elementLocated(By.id('popup-preview-on-creation')));
            await driver.wait(until.elementIsVisible(popup), 10000, 'Timed out after 10 seconds', 2500);

            const title = await driver.wait(until.elementLocated(By.xpath('//*[@id="popup-preview-on-creation"]/div/div/div[1]/h3')));
            const text = await title.getAttribute("innerText");

            expect(text).toEqual("PREVIEW CURRENT ELABEL");
        } catch (err) {
            throw err;
        }
    }, 45000);

    it(`On ${browser}: Validate an empty product form, an error alert pops up if we click "validate"`, async () => {
        try {
            const validate = await driver.wait(until.elementLocated(By.id('submit-form')), 10000, 'Timed out after 10 seconds', 2500);
            await validate.click();

            await driver.wait(until.alertIsPresent());
            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            await alert.accept();

            expect(alertText).toEqual("Please verfie required fields");
        } catch (err) {
            throw err;
        }
    }, 45000);

    it(`On ${browser}: Required fields with "*" turn red with an error message`, async () => {
        try {
            const nameErr = await driver.findElement(By.id('wine_name-feedback'));
            const imageErr = await driver.findElement(By.id('wine_image-feedback'));

            let allInvalid= 0;
            for(let elt of [nameErr, imageErr]) {
                let display = await elt.getCssValue('display');
                if (display !== "block") allInvalid += 1;
            }

            expect(allInvalid).toEqual(0);
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: Internal product reference validation: other than alphanumeric`, async () => {
        try {
            const productRef = await driver.wait(until.elementLocated(By.id('wine_reference_qr')), 5000, 'Timed out after 5 seconds', 2500);
            await driver.wait(until.elementIsVisible(productRef), 5000, 'Timed out after 8 seconds', 2500);
            await productRef.sendKeys('12$gf765gt');

            const productRefErr = await driver.findElement(By.id('wine_reference_qr-feedback'));
            const display = await productRefErr.getCssValue('display');

            await productRef.clear();
            await driver.wait(until.elementIsNotVisible(productRefErr), 8000, 'Timed out after 8 seconds', 2000);

            expect(display).toEqual('block')
        } catch (err) {
            throw err;
        }
    }, 45000);

    it(`On ${browser}: Internal product reference validation: < 8`, async () => {
        try {
            const productRef = await driver.wait(until.elementLocated(By.id('wine_reference_qr')), 5000, 'Timed out after 5 seconds', 2500);
            await driver.wait(until.elementIsVisible(productRef), 5000, 'Timed out after 8 seconds', 2500);
            await productRef.sendKeys('12gf');

            const productRefErr = await driver.findElement(By.id('wine_reference_qr-feedback'));
            const display = await productRefErr.getCssValue('display');

            await productRef.clear();
            await driver.wait(until.elementIsNotVisible(productRefErr), 8000, 'Timed out after 8 seconds', 2000);

            expect(display).toEqual('block')
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: Internal product reference validation: > 13`, async () => {
        try {
            const productRef = await driver.wait(until.elementLocated(By.id('wine_reference_qr')), 5000, 'Timed out after 5 seconds', 2500);
            await driver.wait(until.elementIsVisible(productRef), 5000, 'Timed out after 8 seconds', 2500);
            await productRef.sendKeys('12gf3546ggtyruiy');

            const productRefErr = await driver.findElement(By.id('wine_reference_qr-feedback'));
            const display = await productRefErr.getCssValue('display');

            await productRef.clear();
            await driver.wait(until.elementIsNotVisible(productRefErr), 8000, 'Timed out after 8 seconds', 2000);

            expect(display).toEqual('block')
        } catch (err) {
            throw err;
        }
    }, 35000);

});