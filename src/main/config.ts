/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import packageJson from '../../package.json';
import type { Configuration, StartupApp } from '../ipc/config';
import { OFFICIAL, SourceName } from '../ipc/sources';
import argv from './argv';

let config: Configuration;

export const getConfig = () => config;

const getStartupApp = (): StartupApp | undefined => {
    const localApp = argv['open-local-app'];
    if (localApp != null) {
        return {
            local: true,
            name: localApp,
        };
    }

    const source = argv.source ?? OFFICIAL;

    const downloadableApp = argv['open-downloadable-app'];
    if (downloadableApp != null) {
        return {
            local: false,
            source,
            name: downloadableApp,
        };
    }

    const officialApp = argv['open-official-app'];
    if (officialApp != null) {
        console.warn(
            'Using the command line switch --open-official-app is deprecated,\n' +
                'use --open-downloadable-app instead.'
        );

        return {
            local: false,
            source,
            name: officialApp,
        };
    }
};

export const init = () => {
    const appsRootDir =
        argv['apps-root-dir'] ||
        path.join(app.getPath('home'), '.nrfconnect-apps');

    config = {
        appsRootDir,
        isRunningLauncherFromSource: fs.existsSync(
            path.join(app.getAppPath(), 'README.md')
        ),
        isSkipSplashScreen: argv['skip-splash-screen'],
        isSkipUpdateApps: argv['skip-update-apps'],
        isSkipUpdateLauncher: argv['skip-update-launcher'],
        startupApp: getStartupApp(),
        version: packageJson.version,
    };
};

export const getAppsExternalDir = () =>
    path.join(config.appsRootDir, 'external');

export const getAppsLocalDir = () => path.join(config.appsRootDir, 'local');

export const getAppsRootDir = (sourceName: SourceName = OFFICIAL) =>
    sourceName === OFFICIAL
        ? config.appsRootDir
        : path.join(getAppsExternalDir(), sourceName);

export const getElectronResourcesDir = () =>
    path.join(app.getAppPath(), 'resources');

export const getNodeModulesDir = (sourceName?: string) =>
    path.join(getAppsRootDir(sourceName), 'node_modules');
