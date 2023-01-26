/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import { LaunchableApp } from '../ipc/apps';
import { getElectronResourcesDir } from './config';
import { ifExists } from './fileUtil';

export const getNrfConnectForDesktopIcon = () =>
    path.join(
        getElectronResourcesDir(),
        process.platform === 'win32' ? 'icon.ico' : 'icon.png'
    );

const resourceFile = (app: LaunchableApp, filename: string) =>
    path.join(app.path, 'resources', filename);

const ifExistsAndOnWindowsIcoFile = (app: LaunchableApp) =>
    process.platform !== 'win32'
        ? undefined
        : ifExists(resourceFile(app, 'icon.ico'));

export const getAppIcon = (app: LaunchableApp) =>
    ifExistsAndOnWindowsIcoFile(app) ??
    ifExists(resourceFile(app, 'icon.png')) ??
    getNrfConnectForDesktopIcon();

const shortcutIconName = () => {
    if (process.platform === 'win32') {
        return 'icon.ico';
    }
    if (process.platform === 'darwin') {
        return 'icon.icns';
    }
    return 'icon.png';
};

export const getShortcutIcon = (app: LaunchableApp) =>
    ifExists(resourceFile(app, shortcutIconName())) ?? app.iconPath;
