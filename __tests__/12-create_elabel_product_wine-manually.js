const webdriver = require('selenium-webdriver');
const { Builder, Capabilities, By, until, Select } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();

// use it as: await sleep(ms)
const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    ['Chrome', capChrome],
    ['Edge', capEdge],
    ['FireFox', capFirefox],
])(`Create e-label step 1 (product): Choose "Wine" and "Insert Data Manually"`, (browser, cap) => {
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

    it(`On ${browser}: Login`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('_username'));
            let passwordInput = await driver.findElement(By.name('_password'));
            let submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Ash Raf');
            await passwordInput.sendKeys('PASSword$123');
            await submitButton.click();

            const form = await driver.wait(until.elementLocated(By.xpath('//*[@id="v-pills-0"]/div/div/div/form')), 9000, 'Timed out after 30 seconds', 3000);
            await driver.wait(until.elementIsVisible(form), 9000, 'Timed out after 30 seconds', 3000);

            expect(form).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 35000);
    

    it(`On ${browser}: Click "Next", language selection pop up should render`, async () => {
        try {
            let wineRadio = await driver.findElement(By.xpath('//*[@id="product_type"]/label[1]'));
            let insertManuallyRadio = await driver.findElement(By.xpath('//*[@id="product_source"]/label[3]'));
            let button = await driver.findElement(By.id('product_create'));

            await wineRadio.click();
            await insertManuallyRadio.click();
            await button.click();

            const modal = await driver.wait(until.elementLocated(By.xpath('//*[@id="popup-ref-lang"]')), 9000, 'Timed out after 30 seconds', 3000);
            await driver.wait(until.elementIsVisible(modal), 9000, 'Timed out after 30 seconds', 3000);
            
            let display = await modal.getCssValue('display');

            expect(display).toEqual("block");
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: Choose the "English" language and click "Validate", category page renders`, async () => {
        try {
            let lang = await driver.findElement(By.xpath('//*[@id="popup-ref-lang"]/div/div/div[2]/fieldset/div/div[6]/a'));
            await lang.click();

            const validate = await driver.wait(until.elementLocated(By.id('link-inf')), 9000, 'Timed out after 30 seconds', 3000);
            await driver.wait(until.elementIsVisible(validate), 9000, 'Timed out after 30 seconds', 3000);

            let text = await validate.getAttribute("innerText");

            expect(text).toEqual("Validate");
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: Choose categoty "liqueur wine" and click "Validate", category page renders`, async () => {
        try {
            const selectBox = await driver.wait(until.elementLocated(By.id('ref-ctg')), 9000, 'Timed out after 30 seconds', 3000);
            await driver.wait(until.elementIsVisible(selectBox), 9000, 'Timed out after 30 seconds', 3000);

            let select = new Select(selectBox);

            await select.selectByValue('524');

            let validate = await driver.findElement(By.id('link-inf'));
            await validate.click();

            const form = await driver.wait(until.elementLocated(By.name('wine')), 10000, 'Timed out after 10 seconds', 2500);
            await driver.wait(until.elementIsVisible(form), 9000, 'Timed out after 30 seconds', 3000);

            expect(form).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 35000);
});