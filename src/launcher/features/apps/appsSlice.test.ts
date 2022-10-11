/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { configureStore } from '@reduxjs/toolkit';
import dispatchTo from 'pc-nrfconnect-shared/test/dispatchTo';

import { AppSpec } from '../../../ipc/apps';
import { LOCAL, OFFICIAL } from '../../../ipc/sources';
import { reducer as rootReducer } from '../../store';
import reducer, {
    downloadLatestAppInfoError,
    downloadLatestAppInfoStarted,
    downloadLatestAppInfoSuccess,
    getAllSourceNamesSorted,
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
    showConfirmLaunchDialog,
    State,
    updateAllDownloadableApps,
    upgradeDownloadableAppStarted,
    upgradeDownloadableAppSuccess,
} from './appsSlice';

const generalAppProperties = {
    isInstalled: true,
    currentVersion: '1.0.0',
    engineVersion: '6.1.0',
    path: '',
    iconPath: '',
    shortcutIconPath: '',
} as const;

const localApp1 = {
    name: 'app-a',
    source: LOCAL,
    displayName: 'App A',
    description: 'The local app A',
    isDownloadable: false,

    ...generalAppProperties,
} as const;

const localApp2 = {
    name: 'app-b',
    source: LOCAL,
    displayName: 'App B',
    description: 'The local app B',
    isDownloadable: false,

    ...generalAppProperties,
} as const;

const localApps = [localApp1, localApp2];

const downloadableApp1 = {
    name: 'app-c',
    source: OFFICIAL,
    displayName: 'App C',
    description: 'The local app C',
    isDownloadable: true,
    latestVersion: '1.0.0',
    url: '',

    ...generalAppProperties,
} as const;

const downloadableApp2 = {
    name: 'app-D',
    source: OFFICIAL,
    displayName: 'App D',
    description: 'The local app D',
    isDownloadable: true,
    latestVersion: '1.0.0',
    url: '',

    ...generalAppProperties,
} as const;

const downloadableApps = [downloadableApp1, downloadableApp2];

const initialState = dispatchTo(reducer);

const findApp = (appToFind: AppSpec, state: State) => {
    const foundApp = state.downloadableApps.find(
        app =>
            app.name === downloadableApp1.name &&
            app.source === downloadableApp1.source
    );

    if (foundApp == null) {
        throw new Error(`Found no app '${appToFind}'`);
    }

    return foundApp;
};

describe('appsReducer', () => {
    it('should have no apps in initial state', () => {
        expect(initialState.localApps.length).toEqual(0);
        expect(initialState.downloadableApps.length).toEqual(0);
    });

    it('should be loading apps in initial state', () => {
        expect(initialState.isLoadingLocalApps).toEqual(true);
        expect(initialState.isLoadingDownloadableApps).toEqual(true);
    });

    it('should be loading local apps after loadLocalAppsAction has been dispatched', () => {
        const state = dispatchTo(reducer, [loadLocalAppsStarted()]);
        expect(state.isLoadingLocalApps).toEqual(true);
    });

    it('should have local apps when loadLocalAppsSuccess has been dispatched with apps', () => {
        const state = dispatchTo(reducer, [loadLocalAppsSuccess(localApps)]);
        expect(state.localApps).toEqual(localApps);
    });

    it('should not be loading local apps after loadLocalAppsSuccess has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadLocalAppsStarted(),
            loadLocalAppsSuccess(localApps),
        ]);
        expect(state.isLoadingLocalApps).toEqual(false);
    });

    it('should not be loading local apps after loadLocalAppsError has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadLocalAppsStarted(),
            loadLocalAppsError(),
        ]);
        expect(state.isLoadingLocalApps).toEqual(false);
    });

    it('should be loading downloadable apps after loadDownloadableAppsAction has been dispatched', () => {
        const state = dispatchTo(reducer, [loadDownloadableAppsStarted()]);
        expect(state.isLoadingDownloadableApps).toEqual(true);
    });

    it('should have downloadable apps when loadDownloadableAppsSuccess has been dispatched with apps', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
        ]);
        expect(state.downloadableApps).toMatchObject(downloadableApps);
    });

    it('should not be loading downloadable apps after loadDownloadableAppsSuccess has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadDownloadableAppsStarted(),
            updateAllDownloadableApps(downloadableApps),
        ]);
        expect(state.isLoadingDownloadableApps).toEqual(false);
    });

    it('should not be loading downloadable apps after loadDownloadableAppsError has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadDownloadableAppsStarted(),
            loadDownloadableAppsError(),
        ]);
        expect(state.isLoadingDownloadableApps).toEqual(false);
    });

    it('should be installing app after installDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            installDownloadableAppStarted(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isInstalling).toBe(
            true
        );
    });

    it('should not be installing app after installDownloadableAppSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            installDownloadableAppStarted(downloadableApp1),
            installDownloadableAppSuccess(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isInstalling).toBe(
            false
        );
    });

    it('should not be installing app after installDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            installDownloadableAppStarted(downloadableApp1),
            resetAppProgress(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isInstalling).toBe(
            false
        );
    });

    it('should be removing app after removeDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            removeDownloadableAppStarted(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isRemoving).toBe(true);
    });

    it('should not be removing app after removeDownloadableAppSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            removeDownloadableAppStarted(downloadableApp1),
            removeDownloadableAppSuccess(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isRemoving).toBe(
            false
        );
    });

    it('should not be removing app after removeDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            removeDownloadableAppStarted(downloadableApp1),
            resetAppProgress(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isRemoving).toBe(
            false
        );
    });

    it('should be upgrading app after upgradeDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            upgradeDownloadableAppStarted(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isUpgrading).toBe(
            true
        );
    });

    it('should not be upgrading app after upgradeDownloadableAppSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            upgradeDownloadableAppStarted(downloadableApp1),
            upgradeDownloadableAppSuccess(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isUpgrading).toBe(
            false
        );
    });

    it('should not be removing app after upgradeDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAllDownloadableApps(downloadableApps),
            upgradeDownloadableAppStarted(downloadableApp1),
            resetAppProgress(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isUpgrading).toBe(
            false
        );
    });

    it('should show confirm dialog when showConfirmLaunchDialogAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialog({
                text: 'Do you confirm?',
                app: localApp1,
            }),
        ]);
        expect(state.isConfirmLaunchDialogVisible).toEqual(true);
    });

    it('should add text to state when showConfirmLaunchDialogAction has been dispatched with text', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialog({
                text: 'Do you confirm?',
                app: localApp1,
            }),
        ]);
        expect(state.confirmLaunchText).toEqual('Do you confirm?');
    });

    it('should add app to state when showConfirmLaunchDialogAction has been dispatched with app', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialog({
                text: 'Do you confirm?',
                app: localApp1,
            }),
        ]);
        expect(state.confirmLaunchApp).toEqual(localApp1);
    });

    it('should hide confirm dialog when hideConfirmLaunchDialogAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialog({
                text: 'Do you confirm?',
                app: localApp1,
            }),
            hideConfirmLaunchDialog(),
        ]);
        expect(state.isConfirmLaunchDialogVisible).toEqual(false);
    });

    it('should be downloading latest app info when downloadLatestAppInfoAction has been dispatched', () => {
        const state = dispatchTo(reducer, [downloadLatestAppInfoStarted()]);
        expect(state.isDownloadingLatestAppInfo).toEqual(true);
    });

    it('should not be downloading latest app info when downloadLatestAppInfoSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            downloadLatestAppInfoStarted(),
            downloadLatestAppInfoSuccess(),
        ]);
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should not be downloading latest app info when downloadLatestAppInfoErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            downloadLatestAppInfoStarted(),
            downloadLatestAppInfoError(),
        ]);
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should set a last update check date when downloadLatestAppInfoSuccessAction has been dispatched', () => {
        const aDate = new Date(1972, 5, 27);

        const state = dispatchTo(reducer, [
            downloadLatestAppInfoSuccess(aDate),
        ]);
        expect(state.lastUpdateCheckDate).toEqual(aDate);
    });
});

test('sortedSources sorts the sources into official, local and then the rest in alphabetical order', () => {
    const store = configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({ serializableCheck: false }),
    });
    store.dispatch(
        updateAllDownloadableApps([
            { ...downloadableApp1, source: 'OtherB' },
            { ...downloadableApp1, source: 'official' },
            { ...downloadableApp1, source: 'OtherA' },
        ])
    );

    expect(getAllSourceNamesSorted(store.getState())).toStrictEqual([
        'official',
        'local',
        'OtherA',
        'OtherB',
    ]);
});
