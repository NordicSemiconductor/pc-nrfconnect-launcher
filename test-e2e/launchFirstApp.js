/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const sleep = millis => new Promise(resolve => setTimeout(resolve, millis));

const waitForSecondWindow = async app => {
    for (let retry = 0; retry < 5; retry += 1) {
        // eslint-disable-next-line no-await-in-loop
        if ((await app.client.getWindowCount()) === 2) {
            return;
        }
        await sleep(500); // eslint-disable-line no-await-in-loop
    }

    throw new Error('Timed out while waiting for second window');
};

export default async (app, waitForAppToAppear = true) => {
    await app.client.waitForVisible('button[title*="Open"]');
    await app.client.click('button[title*="Open"]');
    if (waitForAppToAppear) {
        await waitForSecondWindow(app);
        await app.client.waitUntilWindowLoaded();
    }
};
