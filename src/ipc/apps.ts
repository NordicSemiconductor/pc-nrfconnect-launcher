/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as rendererToMain from './infrastructure/rendererToMain';

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

type DownloadAllAppsJsonFiles = () => void;

export const invokeDownloadAllAppsJsonFilesFromRenderer =
    rendererToMain.invoke<DownloadAllAppsJsonFiles>(
        channel.downloadAllAppsJsonFiles
    );

export const registerDownloadAllAppsJsonFilesHandlerFromMain =
    rendererToMain.registerInvoked<DownloadAllAppsJsonFiles>(
        channel.downloadAllAppsJsonFiles
    );

// getLocalApps

type GetLocalApps = () => LocalApp[];

export const invokeGetLocalAppsFromRenderer =
    rendererToMain.invoke<GetLocalApps>(channel.getLocalApps);

export const registerGetLocalAppsHandlerFromMain =
    rendererToMain.registerInvoked<GetLocalApps>(channel.getLocalApps);

// getDownloadableApps

type GetDownloadableApps = () => {
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
};

export const invokeGetDownloadableAppsFromRenderer =
    rendererToMain.invoke<GetDownloadableApps>(channel.getDownloadableApps);

export const registerGetDownloadableAppsHandlerFromMain =
    rendererToMain.registerInvoked<GetDownloadableApps>(
        channel.getDownloadableApps
    );

// downloadReleaseNotes
type DownloadReleaseNotes = (app: DownloadableApp) => string | undefined;

export const invokeDownloadReleaseNotesFromRenderer =
    rendererToMain.invoke<DownloadReleaseNotes>(channel.downloadReleaseNotes);

export const registerDownloadReleaseNotesHandlerFromMain =
    rendererToMain.registerInvoked<DownloadReleaseNotes>(
        channel.downloadReleaseNotes
    );

// installDownloadableApp
type InstallDownloadableApp = (
    name: string,
    version: string,
    source: string
) => void;

export const invokeInstallDownloadableAppFromRenderer =
    rendererToMain.invoke<InstallDownloadableApp>(
        channel.installDownloadableApp
    );

export const registerInstallDownloadableAppHandlerFromMain =
    rendererToMain.registerInvoked<InstallDownloadableApp>(
        channel.installDownloadableApp
    );

// removeDownloadableApp
type RemoveDownloadableApp = (name: string, source: string) => void;

export const invokeRemoveDownloadableAppFromRenderer =
    rendererToMain.invoke<RemoveDownloadableApp>(channel.removeDownloadableApp);

export const registerRemoveDownloadableAppHandlerFromMain =
    rendererToMain.registerInvoked<RemoveDownloadableApp>(
        channel.removeDownloadableApp
    );
