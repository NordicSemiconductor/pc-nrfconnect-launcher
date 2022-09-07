/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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

interface DownloadableApp extends BaseApp {
    source: string;
    homepage: string;
    url: string;
    latestVersion: string;
}

export type UninstalledDownloadableApp = DownloadableApp;

export interface InstalledDownloadableApp
    extends DownloadableApp,
        InstalledApp {
    isOfficial: boolean;
    upgradeAvailable?: boolean;
}

export type App =
    | LocalApp
    | UninstalledDownloadableApp
    | InstalledDownloadableApp;

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

// getOfficialApps

export const registerGetOfficialAppsHandlerFromMain: (
    onGetOfficialApps: () => Promise<{
        fulfilled: DownloadableApp[];
        rejected: DownloadableApp[];
    }>
) => void;

export const invokeGetOfficialAppsFromRenderer: () => Promise<{
    fulfilled: DownloadableApp[];
    rejected: DownloadableApp[];
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

// installOfficialApp

export const registerInstallOfficialAppHandlerFromMain: (
    onInstallOfficialApp: (
        name: string,
        version: string,
        source: string
    ) => Promise<void>
) => void;

export const invokeInstallOfficialAppFromRenderer: (
    name: string,
    version: string,
    source: string
) => Promise<void>;

// removeOfficialApp

export const registerRemoveOfficialAppHandlerFromMain: (
    onRemoveOfficialApp: (name: string, source: string) => Promise<void>
) => void;

export const invokeRemoveOfficialAppFromRenderer: (
    name: string,
    source: string
) => Promise<void>;
