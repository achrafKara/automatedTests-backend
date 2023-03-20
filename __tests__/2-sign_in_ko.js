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
])(`Sign in KO`, (browser, cap) => {
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

    it(`On ${browser}: Clicking on "Sign in" without filling the form, an alert should pop up with an error message`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('_username'));
            let passwordInput = await driver.findElement(By.name('_password'));
            let submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('');
            await passwordInput.sendKeys('');
            await submitButton.click();

            await driver.wait(until.alertIsPresent());
            let alert = await driver.switchTo().alert();
            let alertText = await alert.getText();
            await alert.accept();

            expect(alertText).toEqual("Please verified required fields");
        } catch (err) {
            throw err;
        }
    }, 35000);
    
    it(`On ${browser}: Entring bad credentials, an error message should render on the page`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('_username'));
            let passwordInput = await driver.findElement(By.name('_password'));
            let submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Selenium');
            await passwordInput.sendKeys('Selenium');
            await submitButton.click();

            let message = await driver.findElement(By.className('alert'));
            let value = await message.getText();
            
            expect(value).toEqual("Bad credentials. Username or password is invalid.");
        } catch (err) {
            throw err;
        }
    }, 35000);
});