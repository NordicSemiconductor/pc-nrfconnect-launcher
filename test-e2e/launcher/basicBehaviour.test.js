/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import { version } from '../../package.json';
import { checkTitleOfWindow } from '../assertions';
import setupTestApp from '../setupTestApp';

describe('basic behaviour of the launcher', () => {
    const app = setupTestApp({
        appsRootDir: 'launcher/fixtures/one-local-app/.nrfconnect-apps',
    });

    it('shows package.json version in launcher window title', () =>
        checkTitleOfWindow(app, version));
});

describe('automatic update check', () => {
    describe('When enabled', () => {
        const appsRootDir =
            'launcher/fixtures/check-for-updates-at-startup-enabled/.nrfconnect-apps';
        const settingsJsonPath =
            'launcher/fixtures/check-for-updates-at-startup-enabled/settings.json';

        const app = setupTestApp({
            appsRootDir,
            settingsJsonPath,
            removeAppsRootDirAfterwards: true,
            skipUpdateApps: false,
        });

        it('populates apps.json in .nrfconnect-apps', async () => {
            await app.client.waitForVisible('.list-group-item');

            const appsJsonFile = path.join(
                __dirname,
                '..',
                appsRootDir,
                'apps.json'
            );
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const appsJson = require(appsJsonFile);
            const appNames = Object.keys(appsJson);

            expect(appNames.length).toBeGreaterThan(0);
        });
    });

    describe('When disabled', () => {
        const appsRootDir =
            'launcher/fixtures/check-for-updates-at-startup-disabled/.nrfconnect-apps';
        const settingsJsonPath =
            'launcher/fixtures/check-for-updates-at-startup-disabled/settings.json';

        const app = setupTestApp({
            appsRootDir,
            settingsJsonPath,
            removeAppsRootDirAfterwards: true,
            skipUpdateApps: false,
        });

        it('populates not apps.json in .nrfconnect-apps', async () => {
            await app.client.waitForVisible('#launcher-tabpane-apps');

            const appsJsonFile = path.join(
                __dirname,
                '..',
                appsRootDir,
                'apps.json'
            );
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const appsJson = require(appsJsonFile);

            expect(appsJson).toEqual({});
        });
    });
});

describe('showing apps available on the server', () => {
    const app = setupTestApp({
        appsRootDir: 'launcher/fixtures/app-installation/.nrfconnect-apps',
        removeAppsRootDirAfterwards: true,
        skipUpdateApps: false,
    });

    it('shows apps available on the server', () =>
        app.client.waitForVisible('button[title*="Install"]'));
});
