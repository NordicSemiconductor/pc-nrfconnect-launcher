/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

export interface AppInAppsJson {
    displayName: string;
    description: string;
    url: string;
    homepage?: string;
}

interface BaseApp {
    name: string;
    displayName: string;
    description: string;
}

export interface InstalledApp extends BaseApp {
    currentVersion: string;
    path: string;
    iconPath: string;
    shortcutIconPath: string;
    engineVersion?: string;
    repositoryUrl?: string;
}

export interface LocalApp extends InstalledApp {
    source: null | undefined;
    isOfficial: false;
}

export interface UnversionedDownloadableApp extends BaseApp {
    source: string;
    homepage?: string;
    url: string;
}

export interface DownloadableApp extends UnversionedDownloadableApp {
    latestVersion: string;
}

export type UninstalledDownloadableApp = DownloadableApp;

export interface InstalledDownloadableApp
    extends DownloadableApp,
        InstalledApp {
    isOfficial: boolean;
    upgradeAvailable?: boolean;
}

export type LaunchableApp = LocalApp | InstalledDownloadableApp;

export type App =
    | LocalApp
    | UninstalledDownloadableApp
    | InstalledDownloadableApp;

export interface AppWithError {
    reason: unknown;
    path: string;
    name: string;
    source: string;
}

const channel = {
    downloadAllAppsJsonFiles: 'apps:download-all-apps-json-files',
    getLocalApps: 'apps:get-local-apps',
    getDownloadableApps: 'apps:get-downloadable-apps',
    downloadReleaseNotes: 'apps:download-release-notes',
    installDownloadableApp: 'apps:install-downloadable-app',
    removeDownloadableApp: 'apps:remove-downloadable-app',
};

// downloadAllAppsJsonFiles

export const invokeDownloadAllAppsJsonFilesFromRenderer = (): Promise<void> =>
    ipcRenderer.invoke(channel.downloadAllAppsJsonFiles);

export const registerDownloadAllAppsJsonFilesHandlerFromMain = (
    onDownloadAllAppsJsonFiles: typeof invokeDownloadAllAppsJsonFilesFromRenderer
) =>
    ipcMain.handle(
        channel.downloadAllAppsJsonFiles,
        onDownloadAllAppsJsonFiles
    );

// getLocalApps

export const invokeGetLocalAppsFromRenderer = (): Promise<LocalApp[]> =>
    ipcRenderer.invoke(channel.getLocalApps);

export const registerGetLocalAppsHandlerFromMain = (
    onGetLocalApps: typeof invokeGetLocalAppsFromRenderer
) => ipcMain.handle(channel.getLocalApps, onGetLocalApps);

// getDownloadableApps

export const invokeGetDownloadableAppsFromRenderer: () => Promise<{
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
}> = () => ipcRenderer.invoke(channel.getDownloadableApps);

export const registerGetDownloadableAppsHandlerFromMain = (
    onGetDownloadableApps: typeof invokeGetDownloadableAppsFromRenderer
) => ipcMain.handle(channel.getDownloadableApps, onGetDownloadableApps);

// downloadReleaseNotes

export const invokeDownloadReleaseNotesFromRenderer = (
    app: DownloadableApp
): Promise<string | undefined> =>
    ipcRenderer.invoke(channel.downloadReleaseNotes, app);

export const registerDownloadReleaseNotesHandlerFromMain = (
    onDownloadReleaseNotes: typeof invokeDownloadReleaseNotesFromRenderer
) =>
    ipcMain.handle(
        channel.downloadReleaseNotes,
        (
            _event,
            ...args: Parameters<typeof invokeDownloadReleaseNotesFromRenderer>
        ) => onDownloadReleaseNotes(...args)
    );

// installDownloadableApp

export const invokeInstallDownloadableAppFromRenderer = (
    name: string,
    version: string,
    source: string
): Promise<void> =>
    ipcRenderer.invoke(channel.installDownloadableApp, name, version, source);

export const registerInstallDownloadableAppHandlerFromMain = (
    onInstallDownloadableApp: typeof invokeInstallDownloadableAppFromRenderer
) =>
    ipcMain.handle(
        channel.installDownloadableApp,
        (
            _event,
            ...args: Parameters<typeof invokeInstallDownloadableAppFromRenderer>
        ) => onInstallDownloadableApp(...args)
    );

// removeDownloadableApp

export const invokeRemoveDownloadableAppFromRenderer = (
    name: string,
    source: string
): Promise<void> =>
    ipcRenderer.invoke(channel.removeDownloadableApp, name, source);

export const registerRemoveDownloadableAppHandlerFromMain = (
    onRemoveDownloadableApp: typeof invokeRemoveDownloadableAppFromRenderer
) =>
    ipcMain.handle(
        channel.removeDownloadableApp,
        (
            _event,
            ...args: Parameters<typeof invokeRemoveDownloadableAppFromRenderer>
        ) => onRemoveDownloadableApp(...args)
    );
