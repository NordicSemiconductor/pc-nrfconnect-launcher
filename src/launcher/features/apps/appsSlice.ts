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

export type State = {
    localApps: LocalApp[];
    downloadableApps: (DownloadableApp & { progress?: number })[];
    lastUpdateCheckDate?: Date;
    isDownloadingLatestAppInfo: boolean;
    isLoadingLocalApps: boolean;
    isLoadingDownloadableApps: boolean;
    installingAppName?: string;
    upgradingAppName?: string;
    removingAppName?: string;
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
        loadDownloadableAppsSuccess(
            state,
            {
                payload,
            }: PayloadAction<{
                downloadableApps: DownloadableApp[];
                appToUpdate?: AppSpec;
            }>
        ) {
            state.isLoadingDownloadableApps = false;

            const { appToUpdate, downloadableApps } = payload;
            if (appToUpdate == null) {
                state.downloadableApps = [...downloadableApps];
            } else {
                const equalsAppToUpdate = equalsSpec(appToUpdate);
                const updatedApp = downloadableApps.find(equalsAppToUpdate);

                if (updatedApp != null) {
                    state.downloadableApps = state.downloadableApps.map(app =>
                        equalsAppToUpdate(app) ? updatedApp : app
                    );
                } else {
                    console.error(
                        `No app ${appToUpdate} found in the existing downloadable apps though there is supposed to be one.`
                    );
                }
            }
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
                app.progress = payload.progressFraction;
            });
        },

        // Install downloadable app
        installDownloadableAppStarted(
            state,
            { payload: appToInstall }: PayloadAction<AppSpec>
        ) {
            state.installingAppName = `${appToInstall.source}/${appToInstall.name}`;
        },
        installDownloadableAppSuccess(
            state,
            { payload: installedApp }: PayloadAction<AppSpec>
        ) {
            state.installingAppName = initialState.installingAppName;
            updateApp(installedApp, state.downloadableApps, app => {
                app.progress = undefined;
            });
        },
        installDownloadableAppError(state) {
            state.installingAppName = initialState.installingAppName;
        },

        // Upgrade downloadable app
        upgradeDownloadableAppStarted(
            state,
            { payload: appToUpgrade }: PayloadAction<AppSpec>
        ) {
            state.upgradingAppName = `${appToUpgrade.source}/${appToUpgrade.name}`;
        },
        upgradeDownloadableAppSuccess(
            state,
            { payload: updatedApp }: PayloadAction<AppSpec>
        ) {
            state.upgradingAppName = initialState.upgradingAppName;
            updateApp(updatedApp, state.downloadableApps, app => {
                app.progress = undefined;
            });
        },
        upgradeDownloadableAppError(state) {
            state.upgradingAppName = initialState.upgradingAppName;
        },

        // Remove downloadable app
        removeDownloadableAppStarted(
            state,
            { payload: appToRemove }: PayloadAction<AppSpec>
        ) {
            state.removingAppName = `${appToRemove.source}/${appToRemove.name}`;
        },
        removeDownloadableAppSuccess(
            state,
            { payload: removedApp }: PayloadAction<AppSpec>
        ) {
            state.removingAppName = initialState.removingAppName;

            updateApp(removedApp, state.downloadableApps, app => {
                app.currentVersion = undefined;
                app.isInstalled = false;
            });
        },
        removeDownloadableAppError(state) {
            state.removingAppName = initialState.removingAppName;
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
    installDownloadableAppError,
    installDownloadableAppStarted,
    installDownloadableAppSuccess,
    loadDownloadableAppsError,
    loadDownloadableAppsStarted,
    loadDownloadableAppsSuccess,
    loadLocalAppsError,
    loadLocalAppsStarted,
    loadLocalAppsSuccess,
    removeDownloadableAppError,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    setAppIconPath,
    setAppReleaseNote,
    showConfirmLaunchDialog,
    updateInstallProgress,
    upgradeDownloadableAppError,
    upgradeDownloadableAppStarted,
    upgradeDownloadableAppSuccess,
} = slice.actions;

export const getAllApps = (state: RootState) => {
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

export const getAppsInProgress = (state: RootState) => ({
    installingAppName: state.apps.installingAppName,
    removingAppName: state.apps.removingAppName,
    upgradingAppName: state.apps.upgradingAppName,
});

export const getConfirmLaunch = (state: RootState) => ({
    isDialogVisible: state.apps.isConfirmLaunchDialogVisible,
    text: state.apps.confirmLaunchText,
    app: state.apps.confirmLaunchApp,
});
