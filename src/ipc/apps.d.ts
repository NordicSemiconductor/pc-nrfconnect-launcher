/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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

interface InstalledApp extends BaseApp {
    currentVersion: string;
    path: string;
    iconPath: string;
    shortcutIconPath: string;
    engineVersion?: string;
    repositoryUrl?: string;
}

export interface LocalApp extends InstalledApp {
    source: null;
    isOfficial: false;
}

export interface UnversionedDownloadableApp extends BaseApp {
    source: string;
    homepage?: string;
    url: string;
}

interface DownloadableApp extends UnversionedDownloadableApp {
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

interface AppWithError {
    reason: unknown;
    path: string;
    name: string;
    source: string;
}

// downloadAllAppsJsonFiles

export const registerDownloadAllAppsJsonFilesHandlerFromMain: (
    onDownloadAllAppsJsonFiles: () => Promise<void>
) => void;

export const invokeDownloadAllAppsJsonFilesFromRenderer: () => Promise<void>;

// getLocalApps

export const registerGetLocalAppsHandlerFromMain: (
    onGetLocalApps: () => Promise<LocalApp[]>
) => void;

export const invokeGetLocalAppsFromRenderer: () => Promise<LocalApp[]>;

// getDownloadableApps

export const registerGetDownloadableAppsHandlerFromMain: (
    onGetDownloadableApps: () => Promise<{
        apps: DownloadableApp[];
        appsWithErrors: AppWithError[];
    }>
) => void;

export const invokeGetDownloadableAppsFromRenderer: () => Promise<{
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
}>;

// downloadReleaseNotes

export const registerDownloadReleaseNotesHandlerFromMain: (
    onDownloadReleaseNotes: (
        app: DownloadableApp
    ) => Promise<string | undefined>
) => void;

export const invokeDownloadReleaseNotesFromRenderer: (
    app: DownloadableApp
) => Promise<string | undefined>;

// installDownloadableApp

export const registerInstallDownloadableAppHandlerFromMain: (
    onInstallDownloadableApp: (
        name: string,
        version: string,
        source: string
    ) => Promise<void>
) => void;

export const invokeInstallDownloadableAppFromRenderer: (
    name: string,
    version: string,
    source: string
) => Promise<void>;

// removeDownloadableApp

export const registerRemoveDownloadableAppHandlerFromMain: (
    onRemoveDownloadableApp: (name: string, source: string) => Promise<void>
) => void;

export const invokeRemoveDownloadableAppFromRenderer: (
    name: string,
    source: string
) => Promise<void>;
