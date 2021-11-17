/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication } from 'playwright';

const sleep = (millis: number) =>
    new Promise(resolve => setTimeout(resolve, millis));

const waitForSecondWindow = async (
    app: ElectronApplication,
    currentCount: number
) => {
    for (let retry = 0; retry < 5; retry += 1) {
        // eslint-disable-next-line no-await-in-loop
        if ((await app.windows()).length > currentCount) {
            return;
        }
        await sleep(500); // eslint-disable-line no-await-in-loop
    }

    throw new Error('Timed out while waiting for second window');
};

export default async (app: ElectronApplication, waitForAppToAppear = true) => {
    const windows = await app.windows();
    await windows[0].click('button[title*="Open"]');
    if (waitForAppToAppear) {
        await waitForSecondWindow(app, windows.length);
    }
};
