/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, expect, Page, test } from '@playwright/test';
import path from 'path';
import { _electron as electron } from 'playwright';

import { checkTitleOfWindow } from '../assertions';
import { setup, teardown } from '../setupTestApp';

const startApp = async (extraArgs: string[]) => {
    const projectPath = path.resolve(__dirname, '../../');
    const electronArgs = [
        projectPath,
        '--skip-update-core',
        '--skip-splash-screen',
        ...extraArgs,
    ];

    if (process.env.LOG_ELECTRON_ARGS) {
        console.log(
            `Electron is run with these args: ${electronArgs.join(' ')}`
        );
    }

    const app = await electron.launch({
        args: ['.', ...electronArgs],
    });

    return app;
};

test.describe('launching apps directly', () => {
    test.describe('an official app', () => {
        const appsRootDir =
            'launcher/fixtures/one-official-app-installed/.nrfconnect-apps';
        let app: ElectronApplication;
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
                openOfficialApp: 'pc-nrfconnect-test',
            });

            page = await app.firstWindow();
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
        let page: Page;
        test.beforeAll(async () => {
            app = await setup({
                appsRootDir,
                openLocalApp: 'pc-nrfconnect-test',
            });

            page = await app.firstWindow();
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
