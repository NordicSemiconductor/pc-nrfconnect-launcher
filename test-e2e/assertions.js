/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const checkTitleOfWindow = (app, titleString) =>
    expect(app.client.browserWindow.getTitle()).resolves.toContain(titleString);

export const checkTitleOfSecondWindow = (app, titleString) =>
    expect(
        app.client.windowByIndex(1).browserWindow.getTitle()
    ).resolves.toContain(titleString);

export const checkAppListContains = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');

    await expect(app.client.getText('.list-group-item .h8')).resolves.toEqual(
        appName
    );
};

export const checkHasInstallButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await app.client.waitForVisible(`[title="Install ${appName}"]`);
};

export const checkHasNoInstallButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await expect(
        app.client.isVisible(`[title="Install ${appName}"]`)
    ).resolves.toBe(false);
};

export const checkHasNoLaunchButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await expect(
        app.client.isVisible(`[title="Open ${appName}"]`)
    ).resolves.toBe(false);
};

export const checkShowsAppUpdate = async (app, appName, availableVersion) => {
    await app.client.waitForVisible(`[title="Update ${appName}"]`);
    await expect(app.client.getText('.list-group-item')).resolves.toContain(
        `${availableVersion} available`
    );
};

export const checkShowsNoAppUpdate = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await expect(
        app.client.isVisible(`[title="Update ${appName}"]`)
    ).resolves.toBe(false);

    await expect(app.client.getText('.list-group-item')).resolves.not.toContain(
        'available'
    );
};

export const checkHasRemoveButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await app.client.click('.list-group-item button[aria-haspopup="true"]');
    await app.client.waitForVisible(`[title="Remove ${appName}"]`);
};

export const checkHasNoRemoveButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await app.client.click('.list-group-item button[aria-haspopup="true"]');
    await expect(
        app.client.isVisible(`[title="Remove ${appName}"]`)
    ).resolves.toBe(false);
};
