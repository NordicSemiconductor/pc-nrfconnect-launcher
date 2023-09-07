/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync, readdirSync } from 'fs-extra';
import path from 'path';

import { getBundledResourcesDir } from '../config';
import { isInstalled, readAppInfoFile } from './app';
import { installDownloadableAppCore } from './appChanges';
import { getDownloadableApps } from './apps';

const getApp = (appName: string) =>
    getDownloadableApps().apps.find(
        ({ name, source }) =>
            // TODO: Change Internal to official once quickstart is released to official source
            name === appName && source === 'Internal'
    );

// TODO: Pass/get bundled quickstart version to use for file name and shasum
export const ensureBundledAppExists = async () => {
    const bundledAppsPath = path.join(
        getBundledResourcesDir(),
        'prefetched',
        'appBundles'
    );

    await Promise.allSettled(
        readdirSync(bundledAppsPath).map(pathToTarBall => {
            const appNameRegex = /pc-nrfconnect(-[a-zA-Z]+)+/;
            const versionRegex = /[0-9]+.[0-9]+.[0-9]+/;

            const matchAppName = path
                .basename(pathToTarBall)
                .match(appNameRegex);

            const matchVersion = path
                .basename(pathToTarBall)
                .match(versionRegex);
            if (!matchAppName || !matchVersion) {
                console.log(
                    `Could not determine app name or version. Skipping ${pathToTarBall}`
                );
                return Promise.resolve();
            }

            const appName = matchAppName[0];
            const version = matchVersion[0];

            const app = getApp(appName);
            const appNotInstalled = app && !isInstalled(app);

            const tarBallFullPath = path.join(bundledAppsPath, pathToTarBall);

            if (appNotInstalled && existsSync(tarBallFullPath)) {
                const appSpec = {
                    name: appName,
                    // TODO: Change Internal to official once quickstart is released to official source
                    source: 'Internal',
                };
                const appInfo = readAppInfoFile(appSpec);
                const { shasum } = appInfo.versions[version];
                return installDownloadableAppCore(
                    appSpec,
                    tarBallFullPath,
                    shasum,
                    false
                );
            }

            return Promise.resolve();
        })
    );
};
