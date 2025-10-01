/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import path from 'path';

import { getBundledResourcePath } from '../config';
import { isInstalled, readAppInfoFile } from './app';
import { installDownloadableAppCore } from './appChanges';
import { getDownloadableApps } from './apps';

const getApp = (appName: string) =>
    getDownloadableApps().apps.find(
        ({ name, source }) => name === appName && source === 'official',
    );

export const ensureBundledAppExists = async () => {
    const bundledAppsPath = getBundledResourcePath('prefetched', 'appBundles');
    if (!fs.existsSync(bundledAppsPath)) return;

    await Promise.allSettled(
        fs.readdirSync(bundledAppsPath).map(pathToTarBall => {
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
                    `Could not determine app name or version. Skipping ${pathToTarBall}`,
                );
                return Promise.resolve();
            }

            const appName = matchAppName[0];
            const version = matchVersion[0];

            const app = getApp(appName);
            const appNotInstalled = app && !isInstalled(app);

            const tarBallFullPath = path.join(bundledAppsPath, pathToTarBall);

            if (appNotInstalled && fs.existsSync(tarBallFullPath)) {
                const appSpec = {
                    name: appName,
                    source: 'official',
                };
                const appInfo = readAppInfoFile(appSpec);
                const { shasum, publishTimestamp } = appInfo.versions[version];
                return installDownloadableAppCore(
                    appSpec,
                    tarBallFullPath,
                    shasum,
                    publishTimestamp,
                    false,
                );
            }

            return Promise.resolve();
        }),
    );
};
