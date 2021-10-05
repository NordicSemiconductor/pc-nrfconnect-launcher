/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import electron from 'electron';
import path from 'path';
import rimraf from 'rimraf';
import { Application } from 'spectron';

const startApp = async extraArgs => {
    const projectPath = path.resolve(__dirname, '../');
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

    const app = new Application({
        path: electron,
        args: electronArgs,
        startTimeout: 30000,
        webdriverOptions: {
            waitforTimeout: 10000,
        },
    });

    await app.start();

    expect(app.isRunning()).toEqual(true);

    return app;
};

const stopApp = async app => {
    if (!app || !app.isRunning()) return;

    await app.stop();

    expect(app.isRunning()).toEqual(false);
};

export default ({
    appsRootDir,
    additionalBeforeEach = () => {},
    additionalAfterEach = () => {},
    openLocalApp,
    openOfficialApp,
    removeAppsRootDirAfterwards = false,
    settingsJsonPath,
    skipUpdateApps = true,
} = {}) => {
    const app = {};
    let spectronApp;

    const absoluteAppsRootDir = path.resolve(__dirname, appsRootDir);
    beforeEach(async () => {
        additionalBeforeEach();

        const electronArgs = [
            `--apps-root-dir=${absoluteAppsRootDir}`,
            ...(settingsJsonPath
                ? [
                      `--settings-json-path=${path.join(
                          __dirname,
                          settingsJsonPath
                      )}`,
                  ]
                : []),
            ...(skipUpdateApps ? ['--skip-update-apps'] : []),
            ...(openLocalApp ? [`--open-local-app=${openLocalApp}`] : []),
            ...(openOfficialApp
                ? [`--open-official-app=${openOfficialApp}`]
                : []),
        ];

        spectronApp = await startApp(electronArgs);
        app.client = spectronApp.client;
    });

    afterEach(async () => {
        await stopApp(spectronApp);
        if (removeAppsRootDirAfterwards) {
            rimraf.sync(absoluteAppsRootDir);
        }
        additionalAfterEach();
    });

    return app;
};
