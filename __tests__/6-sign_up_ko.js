const webdriver = require('selenium-webdriver');
const { Builder, Capabilities, By, Color, until } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();

// use it as: await sleep(ms)
// const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    ['Chrome', capChrome],
    ['Edge', capEdge],
    ['FireFox', capFirefox],
])(`Sign up KO`, (browser, cap) => {
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

    it(`On ${browser}: When a required field is empty, an alert with an error message should pop up`, async () => {
        try {
            let submitButton = await driver.findElement(By.name('ezrepoforms_user_register[register]'));

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

    it(`On ${browser}: When a field is not valid, an alert with an error message should pop up`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][username]'));
            let emailInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][email]'));
            let passwordFirstInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][password][first]'));
            let passwordSecondInput = await driver.findElement(By.name('ezrepoforms_user_register[fieldsData][user_account][value][password][second]'));
            let checkBox = await driver.findElement(By.name('term_privacy'));


            await usernameInput.sendKeys('');
            await emailInput.sendKeys('invalidEmail');
            await passwordFirstInput.sendKeys('inv');
            await passwordSecondInput.sendKeys('inv');
            await checkBox.click();

            let invalidFeedback = await driver.findElements(By.className('invalid-feedback'));
            let allInvalid= 0;
            for(let elt of invalidFeedback) {
                let color = await elt.getCssValue('border-color');
                if(color !== "rgb(220, 53, 69)") allInvalid += 1;
            }

            expect(allInvalid).toEqual(0);
        } catch (err) {
            throw err;
        }
    }, 35000);
    
});