/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { configureStore } from '@reduxjs/toolkit';
import dispatchTo from 'pc-nrfconnect-shared/test/dispatchTo';

import { AppSpec } from '../../../ipc/apps';
import {
    createDownloadableTestApp,
    createLocalTestApp,
} from '../../../test/testFixtures';
import { reducer as rootReducer } from '../../store';
import reducer, {
    getAllSourceNamesSorted,
    hideConfirmLaunchDialog,
    installDownloadableAppStarted,
    loadDownloadableAppsError,
    loadDownloadableAppsStarted,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    resetAppProgress,
    setAllDownloadableApps,
    setAllLocalApps,
    showConfirmLaunchDialog,
    State,
    updateDownloadableAppInfo,
    updateDownloadableAppInfos,
    updateDownloadableAppInfosFailed,
    updateDownloadableAppInfosStarted,
    updateDownloadableAppStarted,
} from './appsSlice';

const localApp1 = createLocalTestApp('a');
const localApp2 = createLocalTestApp('b');

const localApps = [localApp1, localApp2];

const downloadableApp1 = createDownloadableTestApp('c');
const downloadableApp2 = createDownloadableTestApp('d');

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
        expect(initialState.isLoadingDownloadableApps).toEqual(true);
    });

    it('should have local apps when setAllLocalApps has been dispatched with apps', () => {
        const state = dispatchTo(reducer, [setAllLocalApps(localApps)]);
        expect(state.localApps).toEqual(localApps);
    });

    it('should be loading downloadable apps after loadDownloadableAppsAction has been dispatched', () => {
        const state = dispatchTo(reducer, [loadDownloadableAppsStarted()]);
        expect(state.isLoadingDownloadableApps).toEqual(true);
    });

    it('should have downloadable apps when loadDownloadableAppsSuccess has been dispatched with apps', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
        ]);
        expect(state.downloadableApps).toMatchObject(downloadableApps);
    });

    it('should not be loading downloadable apps after loadDownloadableAppsSuccess has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadDownloadableAppsStarted(),
            setAllDownloadableApps(downloadableApps),
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
            setAllDownloadableApps(downloadableApps),
            installDownloadableAppStarted(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isInstalling).toBe(
            true
        );
    });

    it('should not be installing app after updateDownloadableAppInfo has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            installDownloadableAppStarted(downloadableApp1),
            updateDownloadableAppInfo(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isInstalling).toBe(
            false
        );
    });

    it('should not be installing app after installDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            installDownloadableAppStarted(downloadableApp1),
            resetAppProgress(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isInstalling).toBe(
            false
        );
    });

    it('should be removing app after removeDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            removeDownloadableAppStarted(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isRemoving).toBe(true);
    });

    it('should not be removing app after removeDownloadableAppSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            removeDownloadableAppStarted(downloadableApp1),
            removeDownloadableAppSuccess(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isRemoving).toBe(
            false
        );
    });

    it('should not be removing app after removeDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            removeDownloadableAppStarted(downloadableApp1),
            resetAppProgress(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isRemoving).toBe(
            false
        );
    });

    it('should be updating app after updateDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            updateDownloadableAppStarted(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isUpdating).toBe(true);
    });

    it('should not be updating app after updateDownloadableAppInfo has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            updateDownloadableAppStarted(downloadableApp1),
            updateDownloadableAppInfo(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isUpdating).toBe(
            false
        );
    });

    it('should not be removing app after updateDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
            updateDownloadableAppStarted(downloadableApp1),
            resetAppProgress(downloadableApp1),
        ]);
        expect(findApp(downloadableApp1, state).progress.isUpdating).toBe(
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

    it('should be downloading latest app info when updateDownloadableAppInfosStarted has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateDownloadableAppInfosStarted(),
        ]);
        expect(state.isDownloadingLatestAppInfo).toEqual(true);
    });

    it('should not be downloading latest app info when updateDownloadableAppInfos has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateDownloadableAppInfosStarted(),
            updateDownloadableAppInfos({ updatedAppInfos: [] }),
        ]);
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should not be downloading latest app info when updateDownloadableAppInfosFailed has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateDownloadableAppInfosStarted(),
            updateDownloadableAppInfosFailed(),
        ]);
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should set a last update check date when updateDownloadableAppInfos has been dispatched', () => {
        const aDate = new Date(1972, 5, 27);

        const state = dispatchTo(reducer, [
            updateDownloadableAppInfos({
                updatedAppInfos: [],
                updateCheckDate: aDate,
            }),
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
        setAllDownloadableApps([
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
