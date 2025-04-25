/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { _electron as electron } from 'playwright';

const startApp = async (extraArgs: string[]) => {
    const projectPath = path.resolve(__dirname, '../');
    const electronArgs = [
        projectPath,
        '--skip-update-launcher',
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

interface setupConfig {
    appsRootDir: string;
    additionalBeforeEach?: () => void;
    openLocalApp?: string;
    openDownloadableApp?: string;
    skipUpdateApps?: boolean;
}

export const setup = async ({
    appsRootDir,
    additionalBeforeEach = () => {},
    openLocalApp,
    openDownloadableApp,
    skipUpdateApps = true,
}: setupConfig) => {
    const absoluteAppsRootDir = path.resolve(__dirname, appsRootDir);
    additionalBeforeEach();

    const electronArgs = [
        `--apps-root-dir=${absoluteAppsRootDir}`,
        ...(skipUpdateApps ? ['--skip-update-apps'] : []),
        ...(openLocalApp ? [`--open-local-app=${openLocalApp}`] : []),
        ...(openDownloadableApp
            ? [`--open-downloadable-app=${openDownloadableApp}`]
            : []),
    ];

    const app = await startApp(electronArgs);

    expect(app).not.toBe(undefined);

    return app;
};

interface teardownConfig {
    app: ElectronApplication;
    appsRootDir: string;
    additionalAfterEach?: () => void;
    removeAppsRootDirAfterwards?: boolean;
}

export const teardown = async ({
    app,
    appsRootDir,
    additionalAfterEach = () => {},
    removeAppsRootDirAfterwards = false,
}: teardownConfig) => {
    const absoluteAppsRootDir = path.resolve(__dirname, appsRootDir);

    await app.close();
    if (removeAppsRootDirAfterwards) {
        fs.rmSync(absoluteAppsRootDir, { recursive: true, force: true });
    }
    additionalAfterEach();
};
