/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AppVersions } from 'pc-nrfconnect-shared';

import { handle, invoke } from './infrastructure/rendererToMain';
import { LOCAL, Source, SourceName } from './sources';

export interface AppSpec {
    name: string;
    source: SourceName;
}

interface BaseApp {
    name: string;
    displayName: string;
    description: string;
    iconPath: string;
}

interface Downloadable {
    source: SourceName;
    homepage?: string;
    versions?: AppVersions;
    releaseNotes?: string;
    latestVersion: string;
}

interface Installed {
    currentVersion: string;
    engineVersion?: string;
    repositoryUrl?: string;
    installed: {
        path: string;
        shasum?: string;
    };
}

export interface LocalApp extends Installed, BaseApp {
    source: typeof LOCAL;
}

export interface InstalledDownloadableApp
    extends BaseApp,
        Installed,
        Downloadable {
    isWithdrawn: false;
}

export interface UninstalledDownloadableApp extends BaseApp, Downloadable {
    isWithdrawn: false;
}

export interface WithdrawnApp extends BaseApp, Installed, Downloadable {
    isWithdrawn: true;
}

export type DownloadableApp =
    | InstalledDownloadableApp
    | UninstalledDownloadableApp
    | WithdrawnApp;

export type LaunchableApp = LocalApp | InstalledDownloadableApp | WithdrawnApp;

export type App = LocalApp | DownloadableApp;

export interface AppWithError extends AppSpec {
    reason: unknown;
    path: string;
}

export const isDownloadable = (app?: App): app is DownloadableApp =>
    app != null && app?.source !== LOCAL;

export const isInstalled = (app?: App): app is LaunchableApp =>
    app != null && 'currentVersion' in app && app.currentVersion != null;

export const isWithdrawn = (app?: App): app is WithdrawnApp =>
    isDownloadable(app) && app.isWithdrawn;

export const isUpdatable = (app?: App): app is InstalledDownloadableApp =>
    !isWithdrawn(app) &&
    isInstalled(app) &&
    isDownloadable(app) &&
    app.currentVersion !== app.latestVersion;

const channel = {
    downloadLatestAppInfos: 'apps:download-latest-app-infos',
    getLocalApps: 'apps:get-local-apps',
    getDownloadableApps: 'apps:get-downloadable-apps',
    installDownloadableApp: 'apps:install-downloadable-app',
    installLocalApp: 'apps:install-local-app',
    removeLocalApp: 'apps:remove-local-app',
    removeDownloadableApp: 'apps:remove-downloadable-app',
};

// downloadLatestAppInfos
type DownloadLatestAppInfos = () => {
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
    sourcesWithErrors: Source[];
};

export const downloadLatestAppInfos = invoke<DownloadLatestAppInfos>(
    channel.downloadLatestAppInfos
);
export const registerDownloadLatestAppInfos = handle<DownloadLatestAppInfos>(
    channel.downloadLatestAppInfos
);

// getLocalApps

type GetLocalApps = () => LocalApp[];

export const getLocalApps = invoke<GetLocalApps>(channel.getLocalApps);
export const registerGetLocalApps = handle<GetLocalApps>(channel.getLocalApps);

// getDownloadableApps

export type GetDownloadableAppsResult = {
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
    sourcesWithErrors: Source[];
};

type GetDownloadableApps = () => GetDownloadableAppsResult;

export const getDownloadableApps = invoke<GetDownloadableApps>(
    channel.getDownloadableApps
);
export const registerGetDownloadableApps = handle<GetDownloadableApps>(
    channel.getDownloadableApps
);

// installDownloadableApp
type InstallDownloadableApp = (
    app: DownloadableApp,
    version?: string
) => DownloadableApp;

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

export const appExists = (appName: string, appPath: string) =>
    ({
        type: 'failure',
        errorType: 'error because app exists',
        appName,
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

// removeLocalApp
type RemoveLocalApp = (appName: string) => void;

export const removeLocalApp = invoke<RemoveLocalApp>(channel.removeLocalApp);
export const registerRemoveLocalApp = handle<RemoveLocalApp>(
    channel.removeLocalApp
);

// removeDownloadableApp
type RemoveDownloadableApp = (app: AppSpec) => void;

export const removeDownloadableApp = invoke<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);
export const registerRemoveDownloadableApp = handle<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);
