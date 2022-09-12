/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

export type StartupApp =
    | {
          local: true;
          name: string;
      }
    | {
          local: false;
          name: string;
          sourceName: string;
      };

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
    releaseNotesUrl: string;
    settingsJsonPath: string;
    sourcesJsonPath: string;
    startupApp?: StartupApp;
    tmpDir: string;
    ubuntuDesktopDir: string;
    userDataDir: string;
    version: string;
}
const channel = 'get-config';

export const getConfig = (): Configuration => ipcRenderer.sendSync(channel);

export const registerGetConfig = (config: Configuration) =>
    ipcMain.on(channel, event => {
        event.returnValue = config;
    });
