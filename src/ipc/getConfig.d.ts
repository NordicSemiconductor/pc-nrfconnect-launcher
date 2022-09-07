/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

interface Configuration {
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
    registryUrl: string;
    releaseNotesUrl: string;
    settingsJsonPath: string;
    sourceName: string;
    sourcesJsonPath: string;
    tmpDir: string;
    ubuntuDesktopDir: string;
    userDataDir: string;
    version: string;
}

export const registerHandlerFromMain: (config: Configuration) => void;
export const getConfigSyncFromRenderer: () => Configuration;
