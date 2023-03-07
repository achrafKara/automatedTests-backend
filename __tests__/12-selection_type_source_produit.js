const webdriver = require('selenium-webdriver');
const { Builder, Capabilities, By, until } = webdriver;
let capEdge = Capabilities.edge();
let capChrome = Capabilities.chrome();
let capFirefox = Capabilities.firefox();

// use it as: await sleep(ms)
const sleep = ms => new Promise(r => setTimeout(r, ms));

describe.each([
    ['Chrome', capChrome],
    // ['Edge', capEdge],
    // ['FireFox', capFirefox],
])(`Sélection de type et source de donnees du produit`, (browser, cap) => {
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

    it(`On ${browser}: login and company profile page should render`, async () => {
        try {
            let usernameInput = await driver.findElement(By.name('_username'));
            let passwordInput = await driver.findElement(By.name('_password'));
            let submitButton = await driver.findElement(By.className('btn-primary'));

            await usernameInput.sendKeys('Ash Raf');
            await passwordInput.sendKeys('PASSword$123');
            await submitButton.click();

            let title = await driver.wait(until.elementLocated(By.className('main-title')), 30000, 'Timed out after 30 seconds', 5000);
            let text = await title.getAttribute("innerText");

            expect(text).toEqual("Company Profile");
        } catch (err) {
            throw err;
        }
    }, 35000);
    
    it(`On ${browser}: Product page should render containing choices for product types`, async () => {
        try {
            let loader = await driver.findElement(By.css('#ftco-loader'));
            await driver.wait(until.elementIsNotVisible(loader), 30000, 'Timed out after 30 seconds', 3000);

            let dropDown = await driver.findElement(By.css('#dropdownMenu1'));
            await dropDown.click();
            let newElabelLink = await driver.findElement(By.css('a[href="/company-account/create-elabel"]'));
            await newElabelLink.click();

            let form = await driver.wait(until.elementLocated(By.name('product')), 9000, 'Timed out after 30 seconds', 3000);

            expect(form).toBeTruthy();
        } catch (err) {
            throw err;
        }
    }, 35000);

    it(`On ${browser}: Language selection pop up should render`, async () => {
        try {
            let wineRadio = await driver.findElement(By.css('#product_type label:nth-child(1)'));
            let insertManuallyRadio = await driver.findElement(By.css('#product_source label:nth-child(3)'));
            let button = await driver.findElement(By.css('#product_create'));
            await wineRadio.click();
            await insertManuallyRadio.click();
            await button.click();

            let modal = await driver.wait(until.elementLocated(By.css('#exampleModalLabel')), 9000, 'Timed out after 30 seconds', 3000);
            let text = await modal.getAttribute("innerText");

            expect(text).toEqual("Select the reference language");
        } catch (err) {
            throw err;
        }
    }, 35000);

    // it(`On ${browser}: choose a language and then a category`, async () => {
    //     try {
    //         // let lang = await driver.findElement(By.css('a[data-lang="eng-GB"]'));
    //         // await lang.click();

    //         let selectBox = await driver.findElement(By.css('#ref-ctg'));
    //         await driver.wait(until.elementIsVisible(selectBox), 9000, 'Timed out after 30 seconds', 3000);

    //         let select = new Select(selectBox);

    //         await select.selectByValue('523');

    //         let validate = await driver.findElement(By.css('#link-inf'));
    //         await validate.click();

    //         let draftBtn = await driver.wait(until.elementLocated(By.css('#preview_wine_draft')), 9000, 'Timed out after 30 seconds', 3000);
    //         let text = await draftBtn.getAttribute("innerText");

    //         expect(text).toEqual("Save draft");
    //     } catch (err) {
    //         throw err;
    //     }
    // }, 35000);
});