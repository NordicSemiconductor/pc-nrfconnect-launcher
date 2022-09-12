/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, test } from '@playwright/test';

import { checkTitleOfWindow } from '../assertions';
import { setup, teardown } from '../setupTestApp';

test.describe('launching apps directly', () => {
    test.describe('a downloadable app', () => {
        const appsRootDir =
            'launcher/fixtures/one-downloadable-app-installed/.nrfconnect-apps';
        let app: ElectronApplication;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
                openDownloadableApp: 'pc-nrfconnect-test',
            });
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
            });
        });

        test('can be launched directly', async () => {
            await checkTitleOfWindow(app, 'Test App');
        });
    });

    test.describe('a local app', () => {
        const appsRootDir = 'launcher/fixtures/one-local-app/.nrfconnect-apps';
        let app: ElectronApplication;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
                openLocalApp: 'pc-nrfconnect-test',
            });
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
            });
        });

        test('can be launched directly', async () => {
            await checkTitleOfWindow(app, 'Test App');
        });
    });
});
