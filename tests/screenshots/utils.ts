import {resolve} from 'path';
import {toMatchImageSnapshot} from 'jest-image-snapshot';
import type {EvaluateFunc} from 'puppeteer';
import Yagr, {MinimalValidConfig} from '../../src';
import puppeteer, {Browser} from 'puppeteer';

if (typeof expect !== 'undefined') {
    expect.extend({toMatchImageSnapshot});
}

const path = resolve(__dirname, './index.html');

declare global {
    interface Window {
        Yagr: typeof Yagr;
        AsyncYagr: (...args: ConstructorParameters<typeof Yagr>) => Promise<Yagr>;
        test: HTMLElement;
    }
}

let browser: Browser;

export async function start() {
    browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
    });

    const page = await browser.newPage();
    await page.setViewport({width: 1100, height: 500});
    await page.goto(`file://${path}`);
    await page.waitForSelector('#test');

    return page;
}

async function getPage() {
    if (!browser) {
        return start();
    }

    const page = await browser.newPage();
    await page.setViewport({width: 1100, height: 500});
    await page.goto(`file://${path}`);
    await page.waitForSelector('#test');
    return page;
}

export async function getImage(configOrFunction: MinimalValidConfig | (() => void)) {
    const page = await getPage();

    if (typeof configOrFunction === 'function') {
        await page.evaluate(configOrFunction);
    } else {
        await page.evaluate(async (config) => {
            await new Promise<unknown>((resolve) => {
                config.hooks = config.hooks || {};
                config.hooks.load = config.hooks.load || [];
                config.hooks.load.push(resolve);
                new window.Yagr(window.test, config); // eslint-disable-line no-new
            });
        }, configOrFunction);
    }

    const imageURL = await page.$eval('#test', (el) => {
        return el.querySelector('canvas')?.toDataURL();
    });

    // convert the data URL to a buffer
    const image = Buffer.from((imageURL || '').split(',')[1], 'base64');

    await page.close();
    return image;
}

export async function getScreenshot<T>(evaluation: EvaluateFunc<[T | undefined]>, data?: T) {
    const page = await getPage();

    await page.evaluate(evaluation, data);

    const image = await page.screenshot();

    await page.close();
    return image;
}
