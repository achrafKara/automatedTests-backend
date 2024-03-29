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
])(`Create e-label step 1 (product): page`, (browser, cap) => {
    let driver;

    beforeAll(async () => {
        driver = new Builder()
            .usingServer('http://localhost:4444')
            .withCapabilities(cap)
            .build();
        await driver.get("https://uat.u-label.com/login");
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
    
    it(`On ${browser}: Product page (Step 1) should render`, async () => {
        try {
            let loader = await driver.findElement(By.id('ftco-loader'));
            await driver.wait(until.elementIsNotVisible(loader), 30000, 'Timed out after 30 seconds', 3000);

            let dropDown = await driver.findElement(By.id('dropdownMenu1'));
            await dropDown.click();
            let newElabelLink = await driver.findElement(By.xpath('/html/body/header/div[1]/div[2]/div[1]/ul/li[1]/div/ul/li[1]/a'));
            await newElabelLink.click();

            let form = await driver.wait(until.elementLocated(By.name('product')), 9000, 'Timed out after 30 seconds', 3000);

            expect(form).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 35000);
});