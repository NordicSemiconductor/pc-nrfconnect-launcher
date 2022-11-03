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
} from './ipc/apps';
import { LOCAL, OFFICIAL } from './ipc/sources';

const url = (appName: string) => `http://example.org/apps/${appName}.json`;
const path = (appName: string) => `/path/to/${appName}`;
const iconPath = (appName: string) => `/path/to/${appName}/icon.png`;
const shortcutIconPath = (appName: string) => `/path/to/${appName}/icon.ico`;

export const createLocalTestApp = (
    appName = 'dummy',
    additonalProps: Partial<LocalApp> = {}
): LocalApp => ({
    name: appName,
    source: LOCAL,
    displayName: `Local ${startCase(appName)} Test App`,
    description: `The local ${lowerCase(appName)} test app`,

    isInstalled: true,
    isDownloadable: false,

    currentVersion: '1.2.3',

    path: path(appName),
    iconPath: iconPath(appName),
    shortcutIconPath: shortcutIconPath(appName),

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

    isInstalled: true,
    isDownloadable: true,

    currentVersion: '4.5.6',
    latestVersion: '4.5.6',
    upgradeAvailable: false,

    url: url(appName),
    path: path(appName),
    iconPath: iconPath(appName),
    shortcutIconPath: shortcutIconPath(appName),

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

    isInstalled: false,
    isDownloadable: true,

    latestVersion: '7.8.9',
    currentVersion: undefined,

    url: url(appName),
    iconPath: iconPath(appName),

    ...additonalProps,
});
