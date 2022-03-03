/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { expect, Page } from '@playwright/test';
import { ElectronApplication } from 'playwright';

const getTitleOfWindow = (app: ElectronApplication, page: Page) =>
    new Promise(resolve =>
        app
            .browserWindow(page)
            .then(browserWindow => browserWindow.getProperty('title'))
            .then(property => resolve(property.jsonValue()))
    );

export const checkTitleOfWindow = async (
    app: ElectronApplication,
    titleString: string
) => {
    const window = await app.firstWindow();
    await expect(getTitleOfWindow(app, window)).resolves.toContain(titleString);
};

export const checkTitleOfLastWindow = async (
    app: ElectronApplication,
    titleString: string
) => {
    const windows = await app.windows();
    await expect(
        getTitleOfWindow(app, windows[windows.length - 1])
    ).resolves.toContain(titleString);
};

export const checkAppListContains = async (page: Page, appName: string) => {
    await page.waitForSelector('.list-group-item');
    await expect(
        page.$$eval('.list-group-item .h8', apps =>
            apps.map(app => app.textContent)
        )
    ).resolves.toContain(appName);
};

export const checkHasInstallButton = async (page: Page, appName: string) => {
    await page.waitForSelector('.list-group-item');
    await expect(
        page.$(`[title="Install ${appName}"]`)
    ).resolves.not.toBeNull();
};

export const checkHasNoInstallButton = async (page: Page, appName: string) => {
    await page.waitForSelector('.list-group-item');
    await expect(page.$(`[title="Install ${appName}"]`)).resolves.toBeNull();
};

export const checkHasNoLaunchButton = async (page: Page, appName: string) => {
    await page.waitForSelector('.list-group-item');
    await expect(page.$(`[title="Open ${appName}"]`)).resolves.toBeNull();
};

export const checkShowsAppUpdate = async (
    page: Page,
    appName: string,
    availableVersion: string
) => {
    await page.waitForSelector(`[title="Update ${appName}"]`);
    expect(page.locator(`.list-group-item`)).toContainText(
        `${availableVersion} available`
    );
};

export const checkShowsNoAppUpdate = async (page: Page, appName: string) => {
    await page.waitForSelector('.list-group-item');
    await expect(page.$(`[title="Update ${appName}"]`)).resolves.toBeNull();
    await expect(
        page.$(`.list-group-item:has-text("available")`)
    ).resolves.toBeNull();
};

export const checkHasRemoveButton = async (page: Page, appName: string) => {
    await page.waitForSelector('.list-group-item');
    await page.click('.list-group-item button[aria-haspopup="true"]');
    await expect(page.$(`[title="Remove ${appName}"]`)).resolves.not.toBeNull();
};

export const checkHasNoRemoveButton = async (page: Page, appName: string) => {
    await page.waitForSelector('.list-group-item');
    await page.click('.list-group-item button[aria-haspopup="true"]');
    await expect(page.$(`[title="Remove ${appName}"]`)).resolves.toBeNull();
};
