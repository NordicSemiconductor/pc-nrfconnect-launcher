/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, expect, Page, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import packageJson from '../../package.json';
import { checkTitleOfWindow } from '../assertions';
import { setup, teardown } from '../setupTestApp';

const { version } = packageJson;

test.describe('basic behaviour of the launcher', () => {
    const appsRootDir = 'launcher/fixtures/one-local-app/.nrfconnect-apps';
    let app: ElectronApplication;
    test.beforeAll(async () => {
        app = await setup({
            appsRootDir,
        });
    });

    test.afterAll(async () => {
        await teardown({
            app,
            appsRootDir,
        });
    });

    test('shows package.json version in launcher window title', async () => {
        await checkTitleOfWindow(app, version);
    });
});

test.describe('automatic update check', () => {
    test.describe('When enabled', () => {
        const appsRootDir =
            'launcher/fixtures/check-for-updates-at-startup-enabled/.nrfconnect-apps';
        const settingsJsonPath =
            'launcher/fixtures/check-for-updates-at-startup-enabled/settings.json';
        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
                settingsJsonPath,
                skipUpdateApps: false,
            });

            page = await app.firstWindow();
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
                removeAppsRootDirAfterwards: true,
            });
        });

        test('populates apps.json in .nrfconnect-apps', async () => {
            await page.waitForSelector('.list-group-item');

            const appsJsonFile = path.join(
                __dirname,
                'fixtures/check-for-updates-at-startup-enabled/.nrfconnect-apps/apps.json'
            );

            const appsJson = JSON.parse(
                fs.readFileSync(appsJsonFile).toString()
            );
            const appNames = Object.keys(appsJson);

            expect(appNames.length).toBeGreaterThan(0);
        });
    });

    test.describe('When disabled', () => {
        const appsRootDir =
            'launcher/fixtures/check-for-updates-at-startup-disabled/.nrfconnect-apps';
        const settingsJsonPath =
            'launcher/fixtures/check-for-updates-at-startup-disabled/settings.json';

        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
                settingsJsonPath,
                skipUpdateApps: false,
            });

            page = await app.firstWindow();
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
                removeAppsRootDirAfterwards: true,
            });
        });

        test('populates not apps.json in .nrfconnect-apps', async () => {
            await page.waitForSelector('#launcher-tabpane-apps');
            await expect(
                page.$('button[title*="Install"]')
            ).resolves.toBeNull();

            const appsJsonFile = path.join(
                __dirname,
                'fixtures/check-for-updates-at-startup-disabled/.nrfconnect-apps/apps.json'
            );

            const appsJson = JSON.parse(
                fs.readFileSync(appsJsonFile).toString()
            );

            expect(appsJson).toEqual({});
        });
    });
});

test.describe('showing apps available on the server', () => {
    let app: ElectronApplication;
    let page: Page;
    const appsRootDir = 'launcher/fixtures/app-installation/.nrfconnect-apps';
    test.beforeAll(async () => {
        app = await setup({
            appsRootDir,
            skipUpdateApps: false,
        });

        page = await app.firstWindow();
    });

    test.afterAll(async () => {
        await teardown({ app, appsRootDir, removeAppsRootDirAfterwards: true });
    });

    test('shows apps available on the server', async () => {
        await page.waitForSelector('.list-group-item');

        await expect(
            page.$('button[title*="Install"]')
        ).resolves.not.toBeNull();
    });
});
