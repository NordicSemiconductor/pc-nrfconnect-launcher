/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { checkAppListContains } from '../assertions';
import setupTestApp from '../setupTestApp';

describe('app installation', () => {
    describe('online from the server', () => {
        const app = setupTestApp({
            appsRootDir: 'launcher/fixtures/app-installation/.nrfconnect-apps',
            removeAppsRootDirAfterwards: true,
            skipUpdateApps: false,
        });

        it('installs and removes an online available app', () =>
            app.client
                .waitForVisible('button[title*="Install"]')
                .click('button[title*="Install"]')
                .click('.list-group-item button[aria-haspopup="true"]')
                .waitForVisible('a[title*="Remove"]')
                .click('a[title*="Remove"]')
                .waitForVisible('button[title*="Install"]'));
    });

    describe('offline from an app archive file', () => {
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
            rimraf.sync(path.join(localDir, appName));
        };

        const copyArchiveToLocal = () => {
            const sourceFile = path.join(__dirname, fixtureDir, appArchiveFile);
            const destFile = path.join(localDir, appArchiveFile);
            fs.copyFileSync(sourceFile, destFile);
        };

        const app = setupTestApp({
            appsRootDir: path.join('launcher', fixtureDir, '.nrfconnect-apps'),
            additionalBeforeEach: copyArchiveToLocal,
            additionalAfterEach: removeAppDirFromLocal,
        });

        it('shows the app name in the launcher app list', () =>
            checkAppListContains(app, 'Foo App'));

        it('removes the archive file', async () => {
            await app.client.waitForVisible('.list-group-item');

            const exists = fs.existsSync(path.join(localDir, appArchiveFile));
            expect(exists).toEqual(false);
        });
    });
});
