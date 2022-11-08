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
    isDownloadable,
    LaunchableApp,
    LocalApp,
} from '../../../ipc/apps';
import { Progress } from '../../../ipc/downloadProgress';
import { allStandardSourceNames, SourceName } from '../../../ipc/sources';
import type { RootState } from '../../store';
import { getAppsFilter } from '../filter/filterSlice';

type AppProgess = {
    isInstalling: boolean;
    isUpdating: boolean;
    isRemoving: boolean;
    fraction: number;
};

const notInProgress = (): AppProgess => ({
    isInstalling: false,
    isUpdating: false,
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

const notEqualsSpec = (specOfSoughtApp: AppSpec) => (app: App) =>
    !equalsSpec(specOfSoughtApp)(app);

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
        addLocalApp(state, { payload: newApp }: PayloadAction<LocalApp>) {
            state.localApps.push(newApp);
        },
        removeLocalApp(state, { payload: appName }: PayloadAction<string>) {
            state.localApps = state.localApps.filter(
                app => app.name !== appName
            );
        },

        // Load Downloadable apps
        loadDownloadableAppsStarted(state) {
            state.isLoadingDownloadableApps = true;
        },
        setAllDownloadableApps(
            state,
            { payload: downloadableApps }: PayloadAction<DownloadableApp[]>
        ) {
            state.isLoadingDownloadableApps = false;
            state.downloadableApps = downloadableApps.map(app => ({
                ...app,
                progress: notInProgress(),
            }));
        },
        updateDownloadableAppInfo(
            state,
            { payload: updatedApp }: PayloadAction<DownloadableApp>
        ) {
            state.isLoadingDownloadableApps = false;
            state.downloadableApps = state.downloadableApps
                .filter(notEqualsSpec(updatedApp))
                .concat({
                    ...updatedApp,
                    progress: notInProgress(),
                });
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

        // Update downloadable app
        updateDownloadableAppStarted(
            state,
            { payload: appToUpdate }: PayloadAction<AppSpec>
        ) {
            updateApp(appToUpdate, state.downloadableApps, app => {
                app.progress.isUpdating = true;
            });
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
    addLocalApp,
    downloadLatestAppInfoError,
    downloadLatestAppInfoStarted,
    downloadLatestAppInfoSuccess,
    hideConfirmLaunchDialog,
    installDownloadableAppStarted,
    loadDownloadableAppsError,
    loadDownloadableAppsStarted,
    loadLocalAppsError,
    loadLocalAppsStarted,
    loadLocalAppsSuccess,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    removeLocalApp,
    resetAppProgress,
    setAppIconPath,
    setAppReleaseNote,
    showConfirmLaunchDialog,
    setAllDownloadableApps,
    updateDownloadableAppInfo,
    updateInstallProgress,
    updateDownloadableAppStarted,
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
        app => app.isInstalled && app.updateAvailable
    ) != null;

export const getUpdateCheckStatus = (state: RootState) => ({
    isCheckingForUpdates: state.apps.isDownloadingLatestAppInfo,
    lastUpdateCheckDate: state.apps.lastUpdateCheckDate,
});

export const getUpdatableVisibleApps = (state: RootState) =>
    state.apps.downloadableApps
        .filter(getAppsFilter(state))
        .filter(app => app.isInstalled && app.updateAvailable);

export const getConfirmLaunch = (state: RootState) => ({
    isDialogVisible: state.apps.isConfirmLaunchDialogVisible,
    text: state.apps.confirmLaunchText,
    app: state.apps.confirmLaunchApp,
});

export const isInProgress = (
    app: DisplayedApp
): app is DownloadableAppWithProgress =>
    isDownloadable(app) &&
    (app.progress.isInstalling ||
        app.progress.isUpdating ||
        app.progress.isRemoving);
