/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import {
    App,
    AppSpec,
    DownloadableApp,
    LaunchableApp,
    LocalApp,
} from '../../../ipc/apps';
import { Progress } from '../../../ipc/downloadProgress';
import { allStandardSourceNames, SourceName } from '../../../ipc/sources';
import type { RootState } from '../../store';
import { getAppsFilter } from '../filter/filterSlice';

type AppProgess = {
    isInstalling: boolean;
    isUpgrading: boolean;
    isRemoving: boolean;
    fraction: number;
};

const notInProgress = (): AppProgess => ({
    isInstalling: false,
    isUpgrading: false,
    isRemoving: false,
    fraction: 0,
});

type DownloadableAppWithProgress = DownloadableApp & {
    progress: AppProgess;
};

export type DisplayedApp = LocalApp | DownloadableAppWithProgress;

export type State = {
    localApps: LocalApp[];
    downloadableApps: DownloadableAppWithProgress[];
    lastUpdateCheckDate?: Date;
    isDownloadingLatestAppInfo: boolean;
    isLoadingLocalApps: boolean;
    isLoadingDownloadableApps: boolean;
    isConfirmLaunchDialogVisible: boolean;
    confirmLaunchText?: string;
    confirmLaunchApp?: LaunchableApp;
};

const initialState: State = {
    localApps: [],
    downloadableApps: [],
    isDownloadingLatestAppInfo: false,
    isLoadingLocalApps: true,
    isLoadingDownloadableApps: true,
    isConfirmLaunchDialogVisible: false,
};

const equalsSpec = (specOfSoughtApp: AppSpec) => (app: App) =>
    app.source === specOfSoughtApp.source && app.name === specOfSoughtApp.name;

const updateApp = <AppType extends App>(
    specOfAppToUpdate: AppSpec,
    apps: AppType[],
    update: (app: AppType) => void
) => {
    const appToUpdate = apps.find(equalsSpec(specOfAppToUpdate));

    if (appToUpdate != null) {
        update(appToUpdate);
    } else {
        console.error(
            `No app ${appToUpdate} found in the existing downloadable apps though there is supposed to be one.`
        );
    }
};

const resetProgress = (
    specOfAppToUpdate: AppSpec,
    apps: DownloadableAppWithProgress[]
) => {
    updateApp(specOfAppToUpdate, apps, app => {
        app.progress = notInProgress();
    });
};

const slice = createSlice({
    name: 'apps',
    initialState,
    reducers: {
        // Load local apps
        loadLocalAppsStarted(state) {
            state.isLoadingLocalApps = true;
        },
        loadLocalAppsSuccess(
            state,
            { payload: localApps }: PayloadAction<LocalApp[]>
        ) {
            state.localApps = [...localApps];
            state.isLoadingLocalApps = false;
        },
        loadLocalAppsError(state) {
            state.isLoadingLocalApps = false;
        },

        // Load Downloadable apps
        loadDownloadableAppsStarted(state) {
            state.isLoadingDownloadableApps = true;
        },
        updateAllDownloadableApps(
            state,
            { payload: downloadableApps }: PayloadAction<DownloadableApp[]>
        ) {
            state.isLoadingDownloadableApps = false;
            state.downloadableApps = downloadableApps.map(app => ({
                ...app,
                progress: notInProgress(),
            }));
        },
        updateDownloadableApp(
            state,
            { payload: updatedApp }: PayloadAction<DownloadableApp>
        ) {
            state.isLoadingDownloadableApps = false;
            state.downloadableApps = state.downloadableApps.map(app =>
                equalsSpec(updatedApp)(app)
                    ? { ...updatedApp, progress: notInProgress() }
                    : app
            );
        },
        loadDownloadableAppsError(state) {
            state.isLoadingDownloadableApps = false;
        },

        // Download latest app info
        downloadLatestAppInfoStarted(state) {
            state.isDownloadingLatestAppInfo = true;
        },
        downloadLatestAppInfoSuccess(
            state,
            {
                payload: updateCheckDate = new Date(),
            }: PayloadAction<Date | undefined>
        ) {
            state.isDownloadingLatestAppInfo = false;
            state.lastUpdateCheckDate = updateCheckDate;
        },
        downloadLatestAppInfoError(state) {
            state.isDownloadingLatestAppInfo = false;
        },

        // Set app specific properties
        setAppIconPath(
            state,
            {
                payload,
            }: PayloadAction<{
                app: AppSpec;
                iconPath: string;
            }>
        ) {
            updateApp(payload.app, state.downloadableApps, app => {
                app.iconPath = payload.iconPath;
            });
        },
        setAppReleaseNote(
            state,
            {
                payload,
            }: PayloadAction<{
                app: AppSpec;
                releaseNote: string;
            }>
        ) {
            updateApp(payload.app, state.downloadableApps, app => {
                app.releaseNote = payload.releaseNote;
            });
        },
        updateInstallProgress(state, { payload }: PayloadAction<Progress>) {
            updateApp(payload.app, state.downloadableApps, app => {
                app.progress.fraction = payload.progressFraction;
            });
        },
        resetAppProgress(state, { payload: app }: PayloadAction<AppSpec>) {
            resetProgress(app, state.downloadableApps);
        },

        // Install downloadable app
        installDownloadableAppStarted(
            state,
            { payload: appToInstall }: PayloadAction<AppSpec>
        ) {
            updateApp(appToInstall, state.downloadableApps, app => {
                app.progress.isInstalling = true;
            });
        },
        installDownloadableAppSuccess(
            state,
            { payload: installedApp }: PayloadAction<AppSpec>
        ) {
            resetProgress(installedApp, state.downloadableApps);
        },

        // Upgrade downloadable app
        upgradeDownloadableAppStarted(
            state,
            { payload: appToUpgrade }: PayloadAction<AppSpec>
        ) {
            updateApp(appToUpgrade, state.downloadableApps, app => {
                app.progress.isUpgrading = true;
            });
        },
        upgradeDownloadableAppSuccess(
            state,
            { payload: updatedApp }: PayloadAction<AppSpec>
        ) {
            resetProgress(updatedApp, state.downloadableApps);
        },

        // Remove downloadable app
        removeDownloadableAppStarted(
            state,
            { payload: appToRemove }: PayloadAction<AppSpec>
        ) {
            updateApp(appToRemove, state.downloadableApps, app => {
                app.progress.isRemoving = true;
            });
        },
        removeDownloadableAppSuccess(
            state,
            { payload: removedApp }: PayloadAction<AppSpec>
        ) {
            resetProgress(removedApp, state.downloadableApps);

            updateApp(removedApp, state.downloadableApps, app => {
                app.currentVersion = undefined;
                app.isInstalled = false;
            });
        },

        // Confirm launch dialog
        showConfirmLaunchDialog(
            state,
            { payload }: PayloadAction<{ text: string; app: LaunchableApp }>
        ) {
            state.isConfirmLaunchDialogVisible = true;
            state.confirmLaunchText = payload.text;
            state.confirmLaunchApp = payload.app;
        },
        hideConfirmLaunchDialog(state) {
            state.isConfirmLaunchDialogVisible = false;
            state.confirmLaunchText = initialState.confirmLaunchText;
            state.confirmLaunchApp = initialState.confirmLaunchApp;
        },
    },
});

export default slice.reducer;

export const {
    downloadLatestAppInfoError,
    downloadLatestAppInfoStarted,
    downloadLatestAppInfoSuccess,
    hideConfirmLaunchDialog,
    installDownloadableAppStarted,
    installDownloadableAppSuccess,
    loadDownloadableAppsError,
    loadDownloadableAppsStarted,
    loadLocalAppsError,
    loadLocalAppsStarted,
    loadLocalAppsSuccess,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    resetAppProgress,
    setAppIconPath,
    setAppReleaseNote,
    showConfirmLaunchDialog,
    updateAllDownloadableApps,
    updateDownloadableApp,
    updateInstallProgress,
    upgradeDownloadableAppStarted,
    upgradeDownloadableAppSuccess,
} = slice.actions;

export const getAllApps = (state: RootState): DisplayedApp[] => {
    const { downloadableApps, localApps } = state.apps;

    return [...localApps, ...downloadableApps];
};

export const getAllSourceNamesSorted = (state: RootState): SourceName[] => {
    const allSources = [
        ...new Set(getAllApps(state).map(({ source }) => source)),
    ];

    const withoutStandardSources = allSources.filter(
        source => !allStandardSourceNames.includes(source)
    );

    return [
        ...allStandardSourceNames,
        ...withoutStandardSources.sort((a, b) => a.localeCompare(b)),
    ];
};

export const getDownloadableApp =
    ({ source, name }: { name?: string; source?: SourceName }) =>
    (state: RootState) =>
        state.apps.downloadableApps.find(
            x => x.source === source && x.name === name
        );

export const isAppUpdateAvailable = (state: RootState) =>
    state.apps.downloadableApps.find(
        app => app.isInstalled && app.upgradeAvailable
    ) != null;

export const getUpdateCheckStatus = (state: RootState) => ({
    isCheckingForUpdates: state.apps.isDownloadingLatestAppInfo,
    lastUpdateCheckDate: state.apps.lastUpdateCheckDate,
});

export const getUpgradeableVisibleApps = (state: RootState) =>
    state.apps.downloadableApps
        .filter(getAppsFilter(state))
        .filter(app => app.isInstalled && app.upgradeAvailable);

export const getIsAnAppInProgress = (state: RootState) =>
    state.apps.downloadableApps.find(isInProgress) != null;

export const getConfirmLaunch = (state: RootState) => ({
    isDialogVisible: state.apps.isConfirmLaunchDialogVisible,
    text: state.apps.confirmLaunchText,
    app: state.apps.confirmLaunchApp,
});

export const isInProgress = (
    app: DisplayedApp
): app is DownloadableAppWithProgress =>
    app.isDownloadable &&
    (app.progress.isInstalling ||
        app.progress.isUpgrading ||
        app.progress.isRemoving);
