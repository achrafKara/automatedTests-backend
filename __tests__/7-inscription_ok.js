const webdriver = require('selenium-webdriver');
const { Builder, Capabilities, By, Color, until } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();

// use it as: await sleep(ms)
// const sleep = ms => new Promise(r => setTimeout(r, ms));

const time_stamp= Date.now() / 1000;

describe.each([
    ['Chrome', capChrome],
    ['Edge', capEdge],
    ['FireFox', capFirefox],
])(`Inscription OK`, (browser, cap) => {
    let driver;

    beforeAll(async () => {
        driver = new Builder()
            .usingServer('http://localhost:4444')
            .withCapabilities(cap)
            .build();
        await driver.get("https://uat.u-label.com/company-register-user");
    }, 30000);

    afterAll(async () => {
        await driver.quit();
    }, 40000);

    it(`On ${browser}: registration completed page should render`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][username]'));
            let emailInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][email]'));
            let passwordFirstInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][password][first]'));
            let passwordSecondInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][password][second]'));
            let checkBox = await driver.findElement(By.name('term_privacy'));
            let submitButton = await driver.findElement(By.className('btn-primary'));


            await usernameInput.sendKeys(`sel${time_stamp}${browser}`);
            await emailInput.sendKeys(`karabila.achraf+${time_stamp}${browser}@gmail.com`);
            await passwordFirstInput.sendKeys('PASSword$123');
            await passwordSecondInput.sendKeys('PASSword$123');
            await checkBox.click();

            await submitButton.click();

            let title = await driver.wait(until.elementLocated(By.className('main-title')), 30000, 'Timed out after 30 seconds', 3000);
            let text = await title.getText();

            expect(text).toEqual("Registration completed");
        } catch (err) {
            throw err;
        }
    }, 35000);
    
});