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
])(`Pas de souscription`, (browser, cap) => {
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

    it(`On ${browser}: login`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('_username'));
            let passwordInput = await driver.findElement(By.name('_password'));
            let submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Ash NoSubscription');
            await passwordInput.sendKeys('PASSword$123');
            await submitButton.click();

            let title = await driver.wait(until.elementLocated(By.className('main-title')), 30000, 'Timed out after 30 seconds', 5000);
            let text = await title.getText();

            expect(text).toEqual("Company Identification");
        } catch (err) {
            throw err;
        }
    }, 35000);
    
    it(`On ${browser}: change subscription page should render with an error`, async () => {
        try {
            let loader = await driver.findElement(By.id('ftco-loader'));
            await driver.wait(until.elementIsNotVisible(loader), 30000, 'Timed out after 30 seconds', 3000);

            let dropDown = await driver.findElement(By.id('dropdownMenu1'));
            await dropDown.click();
            let newElabelLink = await driver.findElement(By.css('a[href="/company-account/create-elabel"]'));
            await newElabelLink.click();

            let title = await driver.wait(until.elementLocated(By.css('.alert-danger')), 30000, 'Timed out after 30 seconds', 3000);
            let text = await title.getText();

            expect(text).toEqual("You can't create elabel, You should have a valid subscription");
        } catch (err) {
            throw err;
        }
    }, 35000);
});