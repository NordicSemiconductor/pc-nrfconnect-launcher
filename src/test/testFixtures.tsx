/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { lowerCase, startCase } from 'lodash';

import {
    InstalledDownloadableApp,
    LocalApp,
    UninstalledDownloadableApp,
} from '../ipc/apps';
import { LOCAL, OFFICIAL } from '../ipc/sources';

const path = (appName: string) => `/path/to/${appName}`;
const iconPath = (appName: string) => `/path/to/${appName}/icon.png`;

export const createLocalTestApp = (
    appName = 'dummy',
    additonalProps: Partial<LocalApp> = {}
): LocalApp => ({
    name: appName,
    source: LOCAL,
    displayName: `Local ${startCase(appName)} Test App`,
    description: `The local ${lowerCase(appName)} test app`,

    currentVersion: '1.2.3',

    iconPath: iconPath(appName),

    installed: {
        path: path(appName),
    },

    ...additonalProps,
});

export const createDownloadableTestApp = (
    appName = 'dummy',
    additonalProps: Partial<InstalledDownloadableApp> = {}
): InstalledDownloadableApp => ({
    name: appName,
    source: OFFICIAL,
    displayName: `Downloadable ${startCase(appName)} Test App`,
    description: `The downloadable ${lowerCase(appName)} test app`,

    currentVersion: '4.5.6',
    latestVersion: '4.5.6',
    isWithdrawn: false,

    iconPath: iconPath(appName),

    installed: {
        path: path(appName),
    },

    ...additonalProps,
});

export const createUninstalledTestApp = (
    appName = 'dummy',
    additonalProps: Partial<UninstalledDownloadableApp> = {}
): UninstalledDownloadableApp => ({
    name: appName,
    source: OFFICIAL,
    displayName: `Uninstalled ${startCase(appName)} Test App`,
    description: `The uninstalled ${lowerCase(appName)} test app`,

    latestVersion: '7.8.9',
    isWithdrawn: false,

    iconPath: iconPath(appName),

    ...additonalProps,
});
