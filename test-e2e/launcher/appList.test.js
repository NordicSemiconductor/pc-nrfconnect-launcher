/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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
import setupTestApp from '../setupTestApp';

describe('the list of all apps', () => {
    describe('has an official app that is available', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-not-installed/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('has no launch button', () =>
            checkHasNoLaunchButton(app, 'Test App'));

        it('has install button', () => checkHasInstallButton(app, 'Test App'));

        it('has no remove button', () =>
            checkHasNoRemoveButton(app, 'Test App'));

        it('shows no available upgrade', () =>
            checkShowsNoAppUpdate(app, 'Test App'));
    });

    describe('has an official apps that is installed', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-installed/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('has no install button', () =>
            checkHasNoInstallButton(app, 'Test App'));

        it('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        it('has a remove button', () => checkHasRemoveButton(app, 'Test App'));

        it('shows no available upgrade', () =>
            checkShowsNoAppUpdate(app, 'Test App'));
    });

    describe('has an official apps that is upgradable', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-upgradable/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('has no install button', () =>
            checkHasNoInstallButton(app, 'Test App'));

        it('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        it('has a remove button', () => checkHasRemoveButton(app, 'Test App'));

        it('shows an available upgrade', () =>
            checkShowsAppUpdate(app, 'Test App', 'v1.2.4'));
    });

    describe('has a local app', () => {
        const app = setupTestApp({
            appsRootDir: 'launcher/fixtures/one-local-app/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        it('has no install button', () =>
            checkHasNoInstallButton(app, 'Test App'));

        it('has no remove button', () =>
            checkHasNoRemoveButton(app, 'Test App'));

        it('shows no available upgrade', () =>
            checkShowsNoAppUpdate(app, 'Test App'));
    });
});
