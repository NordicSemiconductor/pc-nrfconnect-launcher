/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, Page, test } from '@playwright/test';
import { removeSync } from 'fs-extra';
import path from 'path';

import {
    checkAppListContains,
    checkHasInstallButton,
    checkHasNoInstallButton,
    checkHasNoLaunchButton,
    checkHasNoRemoveButton,
    checkHasRemoveButton,
    checkShowsAppUpdate,
    checkShowsNoAppUpdate,
    checkTitleOfLastWindow,
} from '../assertions';
import launchFirstApp from '../launchFirstApp';
import { setup, teardown } from '../setupTestApp';

test.describe('the list of all apps', () => {
    test.describe('has an official app that is available', () => {
        const appsRootDir =
            'launcher/fixtures/one-official-app-not-installed/.nrfconnect-apps/';

        let app: ElectronApplication;
        let page: Page;

        test.beforeAll(async () => {
            app = await setup({ appsRootDir });
            page = await app.firstWindow();
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
            });
            removeSync(
                path.resolve(
                    __dirname,
                    'fixtures/one-official-app-not-installed/.nrfconnect-apps/pc-nrfconnect-ble.svg'
                )
            );
        });

        test('is in the launcher app list', async () => {
            await checkAppListContains(page, 'Bluetooth Low Energy');
        });
        test('has no launch button', async () => {
            await checkHasNoLaunchButton(page, 'Bluetooth Low Energy');
        });
        test('has install button', async () => {
            await checkHasInstallButton(page, 'Bluetooth Low Energy');
        });
        test('has no remove button', async () => {
            await checkHasNoRemoveButton(page, 'Bluetooth Low Energy');
        });
        test('shows no available upgrade', async () => {
            await checkShowsNoAppUpdate(page, 'Bluetooth Low Energy');
        });
    });

    test.describe('has an official apps that is installed', () => {
        const appsRootDir =
            'launcher/fixtures/one-official-app-installed/.nrfconnect-apps';

        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
            });
            page = await app.firstWindow();
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
            });
        });
        test('is in the launcher app list', async () => {
            await checkAppListContains(page, 'Test App');
        });

        test('has no install button', async () => {
            await checkHasNoInstallButton(page, 'Test App');
        });

        test('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfLastWindow(app, 'Test App');
        });

        test('has a remove button', async () => {
            await checkHasRemoveButton(page, 'Test App');
        });

        test('shows no available upgrade', async () => {
            await checkShowsNoAppUpdate(page, 'Test App');
        });
    });

    test.describe('has an official apps that is upgradable', () => {
        const appsRootDir =
            'launcher/fixtures/one-official-app-upgradable/.nrfconnect-apps';

        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
            });

            page = await app.firstWindow();
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
            });
        });
        test('is in the launcher app list', async () => {
            await checkAppListContains(page, 'Test App');
        });

        test('has no install button', async () => {
            await checkHasNoInstallButton(page, 'Test App');
        });

        test('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfLastWindow(app, 'Test App');
        });

        test('has a remove button', async () => {
            await checkHasRemoveButton(page, 'Test App');
        });

        test('shows an available upgrade', async () => {
            await checkShowsAppUpdate(page, 'Test App', 'v1.2.4');
        });
    });

    test.describe('has a local app', () => {
        const appsRootDir = 'launcher/fixtures/one-local-app/.nrfconnect-apps';

        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
            });

            page = await app.firstWindow();
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
            });
        });
        test('is in the launcher app list', async () => {
            await checkAppListContains(page, 'Test App');
        });

        test('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfLastWindow(app, 'Test App');
        });

        test('has no install button', async () => {
            await checkHasNoInstallButton(page, 'Test App');
        });

        test('has no remove button', async () => {
            await checkHasNoRemoveButton(page, 'Test App');
        });

        test('shows no available upgrade', async () => {
            await checkShowsNoAppUpdate(page, 'Test App');
        });
    });
});
