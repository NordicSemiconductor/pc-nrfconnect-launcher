/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

export interface Configuration {
    appsExternalDir: string;
    appsJsonUrl: string;
    appsLocalDir: string;
    appsRootDir: string;
    bundledJlinkVersion: string;
    desktopDir: string;
    electronExePath: string;
    electronResourcesDir: string;
    electronRootPath: string;
    homeDir: string;
    isRunningLauncherFromSource: boolean;
    isSkipSplashScreen: boolean;
    isSkipUpdateApps: boolean;
    isSkipUpdateCore: boolean;
    localAppName: string | null;
    officialAppName: string | null;
    releaseNotesUrl: string;
    settingsJsonPath: string;
    sourceName: string;
    sourcesJsonPath: string;
    tmpDir: string;
    ubuntuDesktopDir: string;
    userDataDir: string;
    version: string;
}
const channel = 'get-config';

export const getConfigSyncFromRenderer = (): Configuration =>
    ipcRenderer.sendSync(channel);

export const registerHandlerFromMain = (config: Configuration) =>
    ipcMain.on(channel, event => {
        event.returnValue = config;
    });
