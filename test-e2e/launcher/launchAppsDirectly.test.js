/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { checkTitleOfWindow } from '../assertions';
import setupTestApp from '../setupTestApp';

describe('launching apps directly', () => {
    describe('an official app', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-installed/.nrfconnect-apps',
            openOfficialApp: 'pc-nrfconnect-test',
        });

        it('can be launched directly', async () => {
            await app.client.waitUntilWindowLoaded();

            await checkTitleOfWindow(app, 'Test App');
        });
    });

    describe('a local app', () => {
        const app = setupTestApp({
            appsRootDir: 'launcher/fixtures/one-local-app/.nrfconnect-apps',
            openLocalApp: 'pc-nrfconnect-test',
        });

        it('can be launched directly', async () => {
            await app.client.waitUntilWindowLoaded();

            await checkTitleOfWindow(app, 'Test App');
        });
    });
});
