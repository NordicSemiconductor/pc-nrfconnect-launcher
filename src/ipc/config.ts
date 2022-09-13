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
    appsRootDir: string;
    isRunningLauncherFromSource: boolean;
    isSkipSplashScreen: boolean;
    isSkipUpdateApps: boolean;
    isSkipUpdateCore: boolean;
    settingsJsonPath: string;
    sourcesJsonPath: string;
    startupApp?: StartupApp;
    version: string;
}
const channel = 'get-config';

export const getConfig = (): Configuration => ipcRenderer.sendSync(channel);

export const registerGetConfig = (onGetConfig: () => Configuration) =>
    ipcMain.on(channel, event => {
        event.returnValue = onGetConfig();
    });
