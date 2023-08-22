/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { mean } from 'lodash';

import {
    App,
    AppSpec,
    DownloadableApp,
    InstalledDownloadableApp,
    isDownloadable,
    isUpdatable,
    isWithdrawn,
    LocalApp,
} from '../../../ipc/apps';
import { Progress } from '../../../ipc/downloadProgress';
import {
    getLastUpdateCheckDate,
    setLastUpdateCheckDate,
} from '../../../ipc/persistedStore';
import { allStandardSourceNames, SourceName } from '../../../ipc/sources';
import type { RootState } from '../../store';
import { getAppsFilter } from '../filter/filterSlice';

type AppProgress = {
    isInstalling: boolean;
    isUpdating: boolean;
    isRemoving: boolean;
    fractions: { [fractionName: string]: number };
};

const notInProgress = (): AppProgress => ({
    isInstalling: false,
    isUpdating: false,
    isRemoving: false,
    fractions: {},
});

const appNotInProgress = <X>(app: X) => ({
    ...app,
    progress: notInProgress(),
});

type DownloadableAppWithProgress = DownloadableApp & {
    progress: AppProgress;
};

export type DisplayedApp = LocalApp | DownloadableAppWithProgress;

export type State = {
    localApps: LocalApp[];
    downloadableApps: DownloadableAppWithProgress[];
    lastUpdateCheckDate?: Date;
    isDownloadingLatestAppInfo: boolean;
};

const initialState: State = {
    localApps: [],
    downloadableApps: [],
    lastUpdateCheckDate: getLastUpdateCheckDate(),
    isDownloadingLatestAppInfo: false,
};

const equalsSpec = (specOfSoughtApp: AppSpec) => (app: App) =>
    app.source === specOfSoughtApp.source && app.name === specOfSoughtApp.name;

const notEqualsSpec = (specOfSoughtApp: AppSpec) => (app: App) =>
    !equalsSpec(specOfSoughtApp)(app);

const addApp = (apps: DownloadableAppWithProgress[], app: DownloadableApp) => {
    apps.push(appNotInProgress(app));
};

const overwriteApp = (
    apps: DownloadableAppWithProgress[],
    app: DownloadableApp
) => {
    const existingAppIndex = apps.findIndex(equalsSpec(app));
    apps[existingAppIndex] = {
        ...app,
        progress: apps[existingAppIndex].progress,
    };
};

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
        // Local apps
        setAllLocalApps(
            state,
            { payload: localApps }: PayloadAction<LocalApp[]>
        ) {
            state.localApps = [...localApps];
        },

        addLocalApp(state, { payload: newApp }: PayloadAction<LocalApp>) {
            state.localApps.push(newApp);
        },

        removeLocalApp(state, { payload: appName }: PayloadAction<string>) {
            state.localApps = state.localApps.filter(
                app => app.name !== appName
            );
        },

        // Downloadable apps
        addDownloadableApps(
            state,
            { payload: apps }: PayloadAction<DownloadableApp[]>
        ) {
            apps.forEach(app => {
                const appIsKnown = state.downloadableApps.some(equalsSpec(app));

                if (appIsKnown) {
                    overwriteApp(state.downloadableApps, app);
                } else {
                    addApp(state.downloadableApps, app);
                }
            });
        },

        removeAppsOfSource(
            state,
            { payload: sourceName }: PayloadAction<SourceName>
        ) {
            state.downloadableApps = state.downloadableApps.filter(
                app => app.source !== sourceName
            );
        },

        // Update downloadable app infos
        updateDownloadableAppInfosStarted(state) {
            state.isDownloadingLatestAppInfo = true;
        },

        updateDownloadableAppInfosSuccess: {
            reducer(state, { payload: updateCheckDate }: PayloadAction<Date>) {
                state.isDownloadingLatestAppInfo = false;
                state.lastUpdateCheckDate = updateCheckDate;
                setLastUpdateCheckDate(updateCheckDate);
            },
            prepare(updateCheckDate: Date = new Date()) {
                return { payload: updateCheckDate };
            },
        },
        updateDownloadableAppInfosFailed(state) {
            state.isDownloadingLatestAppInfo = false;
        },

        // Update progress
        updateAppProgress(
            state,
            { payload: progress }: PayloadAction<Progress>
        ) {
            updateApp(progress.app, state.downloadableApps, app => {
                app.progress.fractions[progress.fractionName] =
                    progress.progressFraction;
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
            const appToBeRemoved = state.downloadableApps.find(
                equalsSpec(removedApp)
            );
            if (appToBeRemoved != null && isWithdrawn(appToBeRemoved)) {
                state.downloadableApps = state.downloadableApps.filter(
                    notEqualsSpec(removedApp)
                );
            } else {
                resetProgress(removedApp, state.downloadableApps);

                updateApp(removedApp, state.downloadableApps, (app: object) => {
                    if ('currentVersion' in app) {
                        delete app.currentVersion;
                    }
                    if ('installed' in app) {
                        delete app.installed;
                    }
                });
            }
        },
    },
});

export default slice.reducer;

export const {
    addDownloadableApps,
    addLocalApp,
    installDownloadableAppStarted,
    removeAppsOfSource,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    removeLocalApp,
    resetAppProgress,
    setAllLocalApps,
    updateDownloadableAppInfosFailed,
    updateDownloadableAppInfosStarted,
    updateDownloadableAppInfosSuccess,
    updateDownloadableAppStarted,
    updateAppProgress,
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
    state.apps.downloadableApps.some(isUpdatable);

export const getUpdateCheckStatus = (state: RootState) => ({
    isCheckingForUpdates: state.apps.isDownloadingLatestAppInfo,
    lastUpdateCheckDate: state.apps.lastUpdateCheckDate,
});

export const getUpdatableVisibleApps = (
    state: RootState
): InstalledDownloadableApp[] =>
    state.apps.downloadableApps
        .filter(getAppsFilter(state))
        .map((app: App) => app) // Narrowing the type, so that the final type is just InstalledDownloadableApp[]
        .filter(isUpdatable);

export const isInProgress = (
    app: DisplayedApp
): app is DownloadableAppWithProgress =>
    isDownloadable(app) &&
    (app.progress.isInstalling ||
        app.progress.isUpdating ||
        app.progress.isRemoving);

export const totalProgress = (app: DownloadableAppWithProgress) => {
    const fractions = Object.values(app.progress.fractions);
    return fractions.length === 0 ? 0 : mean(fractions);
};
