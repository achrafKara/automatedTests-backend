const webdriver = require('selenium-webdriver');
const { Builder, Capabilities, By, until, javasc } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();

// use it as: await sleep(ms)
// const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    ['Chrome', capChrome],
    ['Edge', capEdge],
    ['FireFox', capFirefox],
])(`Identification du produit- validation des champs`, (browser, cap) => {
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
    }, 40000);

    it(`On ${browser}: login`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('_username'));
            let passwordInput = await driver.findElement(By.name('_password'));
            let submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Ash Raf');
            await passwordInput.sendKeys('PASSword$123');
            await submitButton.click();

            let form = await driver.wait(until.elementLocated(By.name('wine')), 10000, 'Timed out after 30 seconds', 5000);

            expect(form).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 35000);
    
    it(`On ${browser}: validate an empty product form, an error alert pops up`, async () => {
        try {
            let create = await driver.wait(until.elementLocated(By.css('#preview_wine_create')), 10000, 'Timed out after 30 seconds', 3000);
            await create.click();

            let validate = await driver.wait(until.elementLocated(By.css('#submit-form')), 10000, 'Timed out after 30 seconds', 3000);
            await driver.wait(until.elementIsVisible(validate), 9000, 'Timed out after 30 seconds', 3000);

            await validate.click();

            await driver.wait(until.alertIsPresent());
            let alert = await driver.switchTo().alert();
            let alertText = await alert.getText();
            await alert.accept();

            expect(alertText).toEqual("Please verfie required fields");
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: required fields with "*" turn red with an error message`, async () => {
        try {
            let nameErr = await driver.findElement(By.css('#wine_name-feedback'));
            let imageErr = await driver.findElement(By.css('#wine_image-feedback'));

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

    it(`On ${browser}: 1.0 Internal product reference - validation: other than alphanumeric`, async () => {
        try {
            let productRef = await driver.findElement(By.css('#wine_reference_qr'));
            await productRef.sendKeys('12$gf765gt');

            let productRefErr = await driver.findElement(By.css('#wine_reference_qr-feedback'));
            let display = await productRefErr.getCssValue('display');

            await productRef.clear();
            await driver.wait(until.elementIsNotVisible(productRefErr), 8000, 'Timed out after 8 seconds', 2000);

            expect(display).toEqual('block')
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: 1.0 Internal product reference - validation: < 8`, async () => {
        try {
            let productRef = await driver.findElement(By.css('#wine_reference_qr'));
            await productRef.sendKeys('12gf');

            let productRefErr = await driver.findElement(By.css('#wine_reference_qr-feedback'));
            let display = await productRefErr.getCssValue('display');

            await productRef.clear();
            await driver.wait(until.elementIsNotVisible(productRefErr), 8000, 'Timed out after 8 seconds', 2000);

            expect(display).toEqual('block')
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: 1.0 Internal product reference - validation: > 13`, async () => {
        try {
            let productRef = await driver.findElement(By.css('#wine_reference_qr'));
            await productRef.sendKeys('12gf3546ggtyruiy');

            let productRefErr = await driver.findElement(By.css('#wine_reference_qr-feedback'));
            let display = await productRefErr.getCssValue('display');

            await productRef.clear();
            await driver.wait(until.elementIsNotVisible(productRefErr), 8000, 'Timed out after 8 seconds', 2000);

            expect(display).toEqual('block')
        } catch (err) {
            throw err;
        }
    }, 35000);

});