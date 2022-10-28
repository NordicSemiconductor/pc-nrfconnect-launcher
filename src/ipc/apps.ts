/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';
import { LOCAL, SourceName } from './sources';

export interface AppSpec {
    name: string;
    source: SourceName;
}

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
    iconPath: string;
}

export interface InstalledApp extends BaseApp {
    currentVersion: string;
    path: string;
    shortcutIconPath: string;
    engineVersion?: string;
    repositoryUrl?: string;
}

export interface LocalApp extends InstalledApp {
    source: typeof LOCAL;
    isDownloadable: false;
    isInstalled: true;
}

export interface UnversionedDownloadableApp extends BaseApp {
    isDownloadable: true;
    source: SourceName;
    homepage?: string;
    url: string;
}

export interface UninstalledDownloadableApp extends UnversionedDownloadableApp {
    isInstalled: false;
    latestVersion: string;
    releaseNote?: string;
    currentVersion: undefined;
}

export interface InstalledDownloadableApp
    extends UnversionedDownloadableApp,
        InstalledApp {
    upgradeAvailable?: boolean;
    isInstalled: true;
    latestVersion: string;
    releaseNote?: string;
}

export type DownloadableApp =
    | InstalledDownloadableApp
    | UninstalledDownloadableApp;

export type LaunchableApp = LocalApp | InstalledDownloadableApp;

export type App = LocalApp | DownloadableApp;

export interface AppWithError extends AppSpec {
    reason: unknown;
    path: string;
}

const channel = {
    downloadAllAppsJsonFiles: 'apps:download-all-apps-json-files',
    getLocalApps: 'apps:get-local-apps',
    getDownloadableApps: 'apps:get-downloadable-apps',
    downloadReleaseNotes: 'apps:download-release-notes',
    installDownloadableApp: 'apps:install-downloadable-app',
    installLocalApp: 'apps:install-local-app',
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
type InstallDownloadableApp = (app: AppSpec, version: string) => void;

export const installDownloadableApp = invoke<InstallDownloadableApp>(
    channel.installDownloadableApp
);
export const registerInstallDownloadableApp = handle<InstallDownloadableApp>(
    channel.installDownloadableApp
);

// installLocalApp

export const successfulInstall = (app: LocalApp) =>
    ({
        type: 'success',
        app,
    } as const);

export const failureReadingFile = (errorMessage: string, error?: unknown) =>
    ({
        type: 'failure',
        errorType: 'error reading file',
        errorMessage,
        error,
    } as const);

export const appExists = (appPath: string) =>
    ({
        type: 'failure',
        errorType: 'error because app exists',
        appPath,
    } as const);

export type InstallResult =
    | ReturnType<typeof successfulInstall>
    | ReturnType<typeof failureReadingFile>
    | ReturnType<typeof appExists>;

type InstallLocalApp = (path: string) => InstallResult;

export const installLocalApp = invoke<InstallLocalApp>(channel.installLocalApp);
export const registerInstallLocalApp = handle<InstallLocalApp>(
    channel.installLocalApp
);

// removeDownloadableApp
type RemoveDownloadableApp = (app: AppSpec) => void;

export const removeDownloadableApp = invoke<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);
export const registerRemoveDownloadableApp = handle<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);
