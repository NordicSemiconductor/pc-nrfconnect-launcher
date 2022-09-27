/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';

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
    isInstalled: boolean;
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
    isDownloadable: false;
    isInstalled: true;
}

export interface UnversionedDownloadableApp extends BaseApp {
    source: string;
    homepage?: string;
    url: string;
}

export interface DownloadableApp extends UnversionedDownloadableApp {
    latestVersion: string;
    releaseNote?: string;
}

export interface UninstalledDownloadableApp extends DownloadableApp {
    isInstalled: false;
}

export interface InstalledDownloadableApp
    extends DownloadableApp,
        InstalledApp {
    isDownloadable: true;
    upgradeAvailable?: boolean;
    isInstalled: true;
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

export const downloadAllAppsJsonFiles = invoke<DownloadAllAppsJsonFiles>(
    channel.downloadAllAppsJsonFiles
);
export const registerDownloadAllAppsJsonFiles =
    handle<DownloadAllAppsJsonFiles>(channel.downloadAllAppsJsonFiles);

// getLocalApps

type GetLocalApps = () => LocalApp[];

export const getLocalApps = invoke<GetLocalApps>(channel.getLocalApps);
export const registerGetLocalApps = handle<GetLocalApps>(channel.getLocalApps);

// getDownloadableApps

type GetDownloadableApps = () => {
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
};

export const getDownloadableApps = invoke<GetDownloadableApps>(
    channel.getDownloadableApps
);
export const registerGetDownloadableApps = handle<GetDownloadableApps>(
    channel.getDownloadableApps
);

// downloadReleaseNotes
type DownloadReleaseNotes = (app: DownloadableApp) => string | undefined;

export const downloadReleaseNotes = invoke<DownloadReleaseNotes>(
    channel.downloadReleaseNotes
);
export const registerDownloadReleaseNotes = handle<DownloadReleaseNotes>(
    channel.downloadReleaseNotes
);

// installDownloadableApp
type InstallDownloadableApp = (
    name: string,
    version: string,
    source: string
) => void;

export const installDownloadableApp = invoke<InstallDownloadableApp>(
    channel.installDownloadableApp
);
export const registerInstallDownloadableApp = handle<InstallDownloadableApp>(
    channel.installDownloadableApp
);

// removeDownloadableApp
type RemoveDownloadableApp = (name: string, source: string) => void;

export const removeDownloadableApp = invoke<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);
export const registerRemoveDownloadableApp = handle<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);
