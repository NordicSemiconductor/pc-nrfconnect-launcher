/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { expect, test } from '@playwright/test';
import path from 'path';
import { _electron as electron } from 'playwright';

import { checkTitleOfWindow } from '../assertions';
import setupTestApp from '../setupTestApp';

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

const sleep = (millis: number) =>
    new Promise(resolve => setTimeout(resolve, millis));
test.describe('launching apps directly', () => {
    test.describe('an official app', () => {
        let app;
        /*
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-installed/.nrfconnect-apps',
            openOfficialApp: 'pc-nrfconnect-test',
        });*/

        test.beforeEach(async () => {
            const absoluteAppsRootDir = path.resolve(
                __dirname,
                'fixtures/one-official-app-installed/.nrfconnect-apps'
            );

            const electronArgs = [
                `--apps-root-dir=${absoluteAppsRootDir}`,
                `--open-official-app=pc-nrfconnect-test`,
            ];

            app = await startApp(electronArgs);

            expect(app).not.toBe(undefined);
        });

        test.afterEach(async () => {
            await app.close();
        });

        test('can be launched directly', async () => {
            const page = await app.firstWindow();

            await checkTitleOfWindow(app, 'Test App');
        });
    });

    /* test.describe('a local app', () => {
        const app = setupTestApp({
            appsRootDir: 'launcher/fixtures/one-local-app/.nrfconnect-apps',
            openLocalApp: 'pc-nrfconnect-test',
        });

        test('can be launched directly', async () => {
            await app.firstWindow();

            await checkTitleOfWindow(app, 'Test App');
        });
    });*/
});
