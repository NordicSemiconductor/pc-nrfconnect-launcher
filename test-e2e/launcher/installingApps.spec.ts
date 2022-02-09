/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, expect, Page, test } from '@playwright/test';
import fs from 'fs';
import { removeSync } from 'fs-extra';
import path from 'path';

import { checkAppListContains } from '../assertions';
import { setup, teardown } from '../setupTestApp';

test.describe('app installation', () => {
    test.describe('online from the server', () => {
        const appsRootDir =
            'launcher/fixtures/app-installation/.nrfconnect-apps';
        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
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

        test('installs and removes an online available app', async () => {
            await page.waitForSelector('button[title*="Install"]');
            await page.click('button[title*="Install"]');
            await page.click('.list-group-item button[aria-haspopup="true"]');
            await page.waitForSelector('a[title*="Remove"]');
            await page.click('a[title*="Remove"]');
            await page.waitForSelector('button[title*="Install"]');
        });
    });

    test.describe('offline from an app archive file', () => {
        const fixtureDir = 'fixtures/one-local-app-to-be-extracted';
        const localDir = path.join(
            __dirname,
            fixtureDir,
            '.nrfconnect-apps',
            'local'
        );
        const appName = 'pc-nrfconnect-foo';
        const appArchiveFile = `${appName}-1.2.3.tgz`;

        const removeAppDirFromLocal = () => {
            removeSync(path.join(localDir, appName));
        };

        const copyArchiveToLocal = () => {
            const sourceFile = path.join(__dirname, fixtureDir, appArchiveFile);
            const destFile = path.join(localDir, appArchiveFile);
            fs.copyFileSync(sourceFile, destFile);
        };

        const appsRootDir = path.join(
            'launcher',
            fixtureDir,
            '.nrfconnect-apps'
        );
        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
                additionalBeforeEach: copyArchiveToLocal,
            });

            page = await app.firstWindow();
        });

        test.afterAll(async () => {
            await teardown({
                app,
                appsRootDir,
                additionalAfterEach: removeAppDirFromLocal,
            });
        });

        test('shows the app name in the launcher app list', async () => {
            await checkAppListContains(page, 'Foo App');
        });

        test('removes the archive file', async () => {
            await page.waitForSelector('.list-group-item');

            const exists = fs.existsSync(path.join(localDir, appArchiveFile));
            expect(exists).toEqual(false);
        });
    });
});
