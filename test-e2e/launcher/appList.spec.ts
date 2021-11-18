/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, Page, test } from '@playwright/test';

import {
    checkAppListContains,
    checkHasInstallButton,
    checkHasNoInstallButton,
    checkHasNoLaunchButton,
    checkHasNoRemoveButton,
    checkHasRemoveButton,
    checkShowsAppUpdate,
    checkShowsNoAppUpdate,
    checkTitleOfSecondWindow,
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
        });

        test('is in the launcher app list', () =>
            checkAppListContains(page, 'Bluetooth Low Energy'));

        test('has no launch button', () =>
            checkHasNoLaunchButton(page, 'Bluetooth Low Energy'));

        test('has install button', () =>
            checkHasInstallButton(page, 'Bluetooth Low Energy'));

        test('has no remove button', () =>
            checkHasNoRemoveButton(page, 'Bluetooth Low Energy'));

        test('shows no available upgrade', () =>
            checkShowsNoAppUpdate(page, 'Bluetooth Low Energy'));
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
        test('is in the launcher app list', () =>
            checkAppListContains(page, 'Test App'));

        test('has no install button', () =>
            checkHasNoInstallButton(page, 'Test App'));

        test('launches the app', async () => {
            await launchFirstApp(app);
            checkTitleOfSecondWindow(app, 'Test App');
        });

        test('has a remove button', () =>
            checkHasRemoveButton(page, 'Test App'));

        test('shows no available upgrade', () =>
            checkShowsNoAppUpdate(page, 'Test App'));
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
        test('is in the launcher app list', () =>
            checkAppListContains(page, 'Test App'));

        test('has no install button', () =>
            checkHasNoInstallButton(page, 'Test App'));

        test('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        test('has a remove button', () =>
            checkHasRemoveButton(page, 'Test App'));

        test('shows an available upgrade', () =>
            checkShowsAppUpdate(page, 'Test App', 'v1.2.4'));
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
        test('is in the launcher app list', () =>
            checkAppListContains(page, 'Test App'));

        test('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        test('has no install button', () =>
            checkHasNoInstallButton(page, 'Test App'));

        test('has no remove button', () =>
            checkHasNoRemoveButton(page, 'Test App'));

        test('shows no available upgrade', () =>
            checkShowsNoAppUpdate(page, 'Test App'));
    });
});
