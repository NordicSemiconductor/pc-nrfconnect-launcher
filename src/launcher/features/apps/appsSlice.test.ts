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
    removeAppsOfSource,
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
    it('has no apps in initial state', () => {
        const initialState = dispatchTo(reducer);

        expect(initialState.localApps.length).toEqual(0);
        expect(initialState.downloadableApps.length).toEqual(0);
    });

    it('has local apps', () => {
        const state = dispatchTo(reducer, [setAllLocalApps(localApps)]);
        expect(state.localApps).toEqual(localApps);
    });

    it('has downloadable apps', () => {
        const state = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
        ]);
        expect(state.downloadableApps).toMatchObject(downloadableApps);
    });

    it('can remove all apps of a source', () => {
        const appOfSourceA = createDownloadableTestApp('app 1', {
            source: 'A',
        });
        const anotherAppOfSourceA = createDownloadableTestApp('app 2', {
            source: 'A',
        });
        const appOfSourceB = createDownloadableTestApp('app 1', {
            source: 'B',
        });
        const anotherAppOfSourceB = createDownloadableTestApp('app 2', {
            source: 'B',
        });

        const state = dispatchTo(reducer, [
            setAllDownloadableApps([
                appOfSourceA,
                anotherAppOfSourceA,
                appOfSourceB,
                anotherAppOfSourceB,
            ]),
            removeAppsOfSource('B'),
        ]);
        expect(state.downloadableApps).toMatchObject([
            appOfSourceA,
            anotherAppOfSourceA,
        ]);
    });

    it('signals when an app is being installed', () => {
        const appIsInstalling = (state: State) =>
            findApp(downloadableApp1, state).progress.isInstalling;

        const initialState = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
        ]);
        expect(appIsInstalling(initialState)).toBe(false);

        const whileInstalling = reducer(
            initialState,
            installDownloadableAppStarted(downloadableApp1)
        );
        expect(appIsInstalling(whileInstalling)).toBe(true);

        const afterFinishingInstalling = reducer(
            whileInstalling,
            updateDownloadableAppInfo(downloadableApp1)
        );
        expect(appIsInstalling(afterFinishingInstalling)).toBe(false);

        const afterAbortingInstalling = reducer(
            whileInstalling,
            resetAppProgress(downloadableApp1)
        );
        expect(appIsInstalling(afterAbortingInstalling)).toBe(false);
    });

    it('signals when an app is being removed', () => {
        const appIsBeingRemoved = (state: State) =>
            findApp(downloadableApp1, state).progress.isRemoving;

        const initialState = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
        ]);
        expect(appIsBeingRemoved(initialState)).toBe(false);

        const whileRemoving = reducer(
            initialState,
            removeDownloadableAppStarted(downloadableApp1)
        );
        expect(appIsBeingRemoved(whileRemoving)).toBe(true);

        const afterFinishingRemoving = reducer(
            whileRemoving,
            removeDownloadableAppSuccess(downloadableApp1)
        );
        expect(appIsBeingRemoved(afterFinishingRemoving)).toBe(false);

        const afterAbortingRemoving = reducer(
            whileRemoving,
            resetAppProgress(downloadableApp1)
        );
        expect(appIsBeingRemoved(afterAbortingRemoving)).toBe(false);
    });

    it('signals when an app is being updated', () => {
        const appIsBeingUpdated = (state: State) =>
            findApp(downloadableApp1, state).progress.isUpdating;

        const initialState = dispatchTo(reducer, [
            setAllDownloadableApps(downloadableApps),
        ]);
        expect(appIsBeingUpdated(initialState)).toBe(false);

        const whileUpdating = reducer(
            initialState,
            updateDownloadableAppStarted(downloadableApp1)
        );
        expect(appIsBeingUpdated(whileUpdating)).toBe(true);

        const afterFinishingUpdating = reducer(
            whileUpdating,
            updateDownloadableAppInfo(downloadableApp1)
        );
        expect(appIsBeingUpdated(afterFinishingUpdating)).toBe(false);

        const afterAbortingUpdating = reducer(
            whileUpdating,
            resetAppProgress(downloadableApp1)
        );
        expect(appIsBeingUpdated(afterAbortingUpdating)).toBe(false);
    });

    it('signals when the latest app info are downloaded', () => {
        const initialState = dispatchTo(reducer);
        expect(initialState.isDownloadingLatestAppInfo).toBe(false);

        const whileUpdating = reducer(
            initialState,
            updateDownloadableAppInfosStarted()
        );
        expect(whileUpdating.isDownloadingLatestAppInfo).toBe(true);

        const afterFinishingUpdating = reducer(
            whileUpdating,
            updateDownloadableAppInfos({ updatedAppInfos: [] })
        );
        expect(afterFinishingUpdating.isDownloadingLatestAppInfo).toBe(false);

        const afterAbortingUpdating = reducer(
            whileUpdating,
            updateDownloadableAppInfosFailed()
        );
        expect(afterAbortingUpdating.isDownloadingLatestAppInfo).toBe(false);
    });

    it('has the date of the last update check', () => {
        const aDate = new Date(1972, 5, 27);

        const state = dispatchTo(reducer, [
            updateDownloadableAppInfos({
                updatedAppInfos: [],
                updateCheckDate: aDate,
            }),
        ]);
        expect(state.lastUpdateCheckDate).toEqual(aDate);
    });

    describe('confirm dialog', () => {
        it('signals when the dialog is shown', () => {
            const initialState = dispatchTo(reducer);
            expect(initialState.isConfirmLaunchDialogVisible).toEqual(false);

            const dialogIsShown = dispatchTo(reducer, [
                showConfirmLaunchDialog({
                    text: 'Do you confirm?',
                    app: localApp1,
                }),
            ]);
            expect(dialogIsShown.isConfirmLaunchDialogVisible).toEqual(true);

            const dialogIsClosed = reducer(
                dialogIsShown,
                hideConfirmLaunchDialog()
            );
            expect(dialogIsClosed.isConfirmLaunchDialogVisible).toEqual(false);
        });

        it('has a text', () => {
            const state = dispatchTo(reducer, [
                showConfirmLaunchDialog({
                    text: 'Do you confirm?',
                    app: localApp1,
                }),
            ]);
            expect(state.confirmLaunchText).toEqual('Do you confirm?');
        });

        it('has an app', () => {
            const state = dispatchTo(reducer, [
                showConfirmLaunchDialog({
                    text: 'Do you confirm?',
                    app: localApp1,
                }),
            ]);
            expect(state.confirmLaunchApp).toEqual(localApp1);
        });
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
