const webdriver = require('selenium-webdriver');
const { Builder, Capabilities, By, until } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();

// use it as: await sleep(ms)
// const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    ['Chrome', capChrome],
    ['Edge', capEdge],
    ['FireFox', capFirefox],
])(`Create e-label step 1 (product): send form with empty data`, (browser, cap) => {
    let driver;

    beforeAll(async () => {
        driver = new Builder()
            .usingServer('http://localhost:4444')
            .withCapabilities(cap)
            .build();
        await driver.get("https://uat.u-label.com/company-account/create-elabel");
    }, 30000);

    afterAll(async () => {
        await driver.quit();
    }, 40000);

    it(`On ${browser}: Sign in`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('_username'));
            let passwordInput = await driver.findElement(By.name('_password'));
            let submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Ash Raf');
            await passwordInput.sendKeys('PASSword$123');
            await submitButton.click();

            let title = await driver.wait(until.elementLocated(By.className('main-title')), 30000, 'Timed out after 30 seconds', 5000);
            let text = await title.getText();

            expect(text).toEqual("Company Profile");
        } catch (err) {
            throw err;
        }
    }, 35000);
    
    it(`On ${browser}: Clicking on next without choosing a field, an error occur`, async () => {
        try {
            let button = await driver.wait(until.elementLocated(By.id('product_create')), 9000, 'Timed out after 30 seconds', 3000);
            await button.click();

            await driver.wait(until.alertIsPresent());
            let alert = await driver.switchTo().alert();
            let alertText = await alert.getText();
            await alert.accept();

            expect(alertText).toEqual("Please verfie required fields");
        } catch (err) {
            throw err;
        }
    }, 35000);
});