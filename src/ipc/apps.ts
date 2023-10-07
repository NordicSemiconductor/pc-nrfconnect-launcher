/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    App,
    AppSpec,
    AppWithError,
    DownloadableApp,
    forRenderer as forRendererFromShared,
    inMain as inMainFromShared,
    InstalledDownloadableApp,
    isDownloadable,
    isInstalled,
    isUpdatable,
    isWithdrawn,
    LaunchableApp,
    LocalApp,
    SourceWithError,
    UninstalledDownloadableApp,
    WithdrawnApp,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/apps';
import {
    handle,
    invoke,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

export {
    isDownloadable,
    isInstalled,
    isUpdatable,
    isWithdrawn,
    type App,
    type AppSpec,
    type AppWithError,
    type DownloadableApp,
    type InstalledDownloadableApp,
    type LaunchableApp,
    type LocalApp,
    type SourceWithError,
    type UninstalledDownloadableApp,
    type WithdrawnApp,
};

const quickStartAppName = 'pc-nrfconnect-quickstart';

export const isQuickStartApp = (app: App) => app.name === quickStartAppName;

const channel = {
    downloadLatestAppInfos: 'apps:download-latest-app-infos',
    getLocalApps: 'apps:get-local-apps',
    installLocalApp: 'apps:install-local-app',
    removeLocalApp: 'apps:remove-local-app',
    removeDownloadableApp: 'apps:remove-downloadable-app',
};

// downloadLatestAppInfos
type DownloadLatestAppInfos = () => {
    apps: DownloadableApp[];
    appsWithErrors: AppWithError[];
    sourcesWithErrors: SourceWithError[];
};

const downloadLatestAppInfos = invoke<DownloadLatestAppInfos>(
    channel.downloadLatestAppInfos
);
const registerDownloadLatestAppInfos = handle<DownloadLatestAppInfos>(
    channel.downloadLatestAppInfos
);

// getLocalApps

type GetLocalApps = () => LocalApp[];

const getLocalApps = invoke<GetLocalApps>(channel.getLocalApps);
const registerGetLocalApps = handle<GetLocalApps>(channel.getLocalApps);

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

const installLocalApp = invoke<InstallLocalApp>(channel.installLocalApp);
const registerInstallLocalApp = handle<InstallLocalApp>(
    channel.installLocalApp
);

// removeLocalApp
type RemoveLocalApp = (appName: string) => void;

const removeLocalApp = invoke<RemoveLocalApp>(channel.removeLocalApp);
const registerRemoveLocalApp = handle<RemoveLocalApp>(channel.removeLocalApp);

// removeDownloadableApp
type RemoveDownloadableApp = (app: AppSpec) => void;

const removeDownloadableApp = invoke<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);
const registerRemoveDownloadableApp = handle<RemoveDownloadableApp>(
    channel.removeDownloadableApp
);

export const forRenderer = {
    ...forRendererFromShared,
    registerDownloadLatestAppInfos,
    registerInstallLocalApp,
    registerRemoveDownloadableApp,
    registerRemoveLocalApp,
    registerGetLocalApps,
};

export const inMain = {
    ...inMainFromShared,
    downloadLatestAppInfos,
    getLocalApps,
    installLocalApp,
    removeLocalApp,
    removeDownloadableApp,
};
