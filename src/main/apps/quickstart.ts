/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs-extra';

import { getElectronResourcesDir } from '../config';
import { isInstalled, readAppInfoFile } from './app';
import { installDownloadableAppCore } from './appChanges';
import { getDownloadableApps } from './apps';

const getQuickstartApp = () =>
    getDownloadableApps().apps.find(
        ({ name, source }) =>
            name === 'pc-nrfconnect-quickstart' && source === 'Internal'
    );

export const ensureQuickstartAppExists = async () => {
    const quickstartAppPackage = `${getElectronResourcesDir()}/prefetched/pc-nrfconnect-quickstart-0.0.1.tgz`;
    const quickstartApp = getQuickstartApp();
    const quickstartAppNotInstalled =
        quickstartApp && !isInstalled(quickstartApp);
    if (quickstartAppNotInstalled && existsSync(quickstartAppPackage)) {
        const appSpec = {
            name: 'pc-nrfconnect-quickstart',
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
