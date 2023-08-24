/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs-extra';

import { getBundledResourcesDir } from '../config';
import { isInstalled, readAppInfoFile } from './app';
import { installDownloadableAppCore } from './appChanges';
import { getDownloadableApps } from './apps';

export const quickstartAppName = 'pc-nrfconnect-quickstart';

const getQuickstartApp = () =>
    getDownloadableApps().apps.find(
        ({ name, source }) =>
            // TODO: Change Internal to official once quickstart is released to official source
            name === quickstartAppName && source === 'Internal'
    );

// TODO: Pass/get bundled quickstart version to use for file name and shasum
export const ensureQuickstartAppExists = async () => {
    const quickstartAppPackage = `${getBundledResourcesDir()}/prefetched/pc-nrfconnect-quickstart-0.0.1.tgz`;
    const quickstartApp = getQuickstartApp();
    const quickstartAppNotInstalled =
        quickstartApp && !isInstalled(quickstartApp);
    if (quickstartAppNotInstalled && existsSync(quickstartAppPackage)) {
        const appSpec = {
            name: quickstartAppName,
            // TODO: Change Internal to official once quickstart is released to official source
            source: 'Internal',
        };
        const { shasum } = readAppInfoFile(appSpec).versions['0.0.1'];
        await installDownloadableAppCore(
            appSpec,
            quickstartAppPackage,
            shasum,
            false
        );
    }
};
