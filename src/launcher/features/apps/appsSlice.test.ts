/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '@nordicsemiconductor/pc-nrfconnect-shared/test/dispatchTo';

import { AppSpec } from '../../../ipc/apps';
import {
    createDownloadableTestApp,
    createLocalTestApp,
} from '../../../test/testFixtures';
import reducer, {
    addDownloadableApps,
    installDownloadableAppStarted,
    removeAppsOfSource,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    resetAppInstallProgress,
    setAllLocalApps,
    State,
    updateDownloadableAppInfosFailed,
    updateDownloadableAppInfosStarted,
    updateDownloadableAppInfosSuccess,
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
            app.source === downloadableApp1.source,
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
            addDownloadableApps(downloadableApps),
        ]);
        expect(state.downloadableApps).toMatchObject(downloadableApps);
    });

    it('can add downloadable apps', () => {
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
            addDownloadableApps([appOfSourceA, anotherAppOfSourceA]),
            addDownloadableApps([appOfSourceB, anotherAppOfSourceB]),
        ]);
        expect(state.downloadableApps).toMatchObject([
            appOfSourceA,
            anotherAppOfSourceA,
            appOfSourceB,
            anotherAppOfSourceB,
        ]);
    });

    it('can update downloadable apps', () => {
        const app = createDownloadableTestApp('app 1', {
            description: 'Old description',
        });
        const updatedApp = createDownloadableTestApp('app 1', {
            description: 'New description',
        });

        const state = dispatchTo(reducer, [
            addDownloadableApps([app]),
            addDownloadableApps([updatedApp]),
        ]);
        expect(state.downloadableApps).toMatchObject([updatedApp]);
    });

    it('keeps the progress when updating downloadable apps', () => {
        const app = createDownloadableTestApp('app 1', {
            description: 'Old description',
        });

        const state = dispatchTo(reducer, [
            addDownloadableApps([app]),
            installDownloadableAppStarted(app),
            addDownloadableApps([app]),
        ]);
        expect(state.downloadableApps[0].progress.isInstalling).toBe(true);
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
            addDownloadableApps([
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
            addDownloadableApps(downloadableApps),
        ]);
        expect(appIsInstalling(initialState)).toBe(false);

        const whileInstalling = reducer(
            initialState,
            installDownloadableAppStarted(downloadableApp1),
        );
        expect(appIsInstalling(whileInstalling)).toBe(true);

        const afterFinishingInstalling = reducer(
            whileInstalling,
            resetAppInstallProgress(downloadableApp1),
        );
        expect(appIsInstalling(afterFinishingInstalling)).toBe(false);
    });

    it('signals when an app is being removed', () => {
        const appIsBeingRemoved = (state: State) =>
            findApp(downloadableApp1, state).progress.isRemoving;

        const initialState = dispatchTo(reducer, [
            addDownloadableApps(downloadableApps),
        ]);
        expect(appIsBeingRemoved(initialState)).toBe(false);

        const whileRemoving = reducer(
            initialState,
            removeDownloadableAppStarted(downloadableApp1),
        );
        expect(appIsBeingRemoved(whileRemoving)).toBe(true);

        const afterFinishingRemoving = reducer(
            whileRemoving,
            removeDownloadableAppSuccess(downloadableApp1),
        );
        expect(appIsBeingRemoved(afterFinishingRemoving)).toBe(false);

        const afterAbortingRemoving = reducer(
            whileRemoving,
            resetAppInstallProgress(downloadableApp1),
        );
        expect(appIsBeingRemoved(afterAbortingRemoving)).toBe(false);
    });

    it('signals when an app is being updated', () => {
        const appIsBeingUpdated = (state: State) =>
            findApp(downloadableApp1, state).progress.isUpdating;

        const initialState = dispatchTo(reducer, [
            addDownloadableApps(downloadableApps),
        ]);
        expect(appIsBeingUpdated(initialState)).toBe(false);

        const whileUpdating = reducer(
            initialState,
            updateDownloadableAppStarted(downloadableApp1),
        );
        expect(appIsBeingUpdated(whileUpdating)).toBe(true);

        const afterFinishingUpdating = reducer(
            whileUpdating,
            resetAppInstallProgress(downloadableApp1),
        );
        expect(appIsBeingUpdated(afterFinishingUpdating)).toBe(false);
    });

    it('signals when the latest app info are downloaded', () => {
        const initialState = dispatchTo(reducer);
        expect(initialState.isDownloadingLatestAppInfo).toBe(false);

        const whileUpdating = reducer(
            initialState,
            updateDownloadableAppInfosStarted(),
        );
        expect(whileUpdating.isDownloadingLatestAppInfo).toBe(true);

        const afterFinishingUpdating = reducer(
            whileUpdating,
            updateDownloadableAppInfosSuccess(),
        );
        expect(afterFinishingUpdating.isDownloadingLatestAppInfo).toBe(false);

        const afterAbortingUpdating = reducer(
            whileUpdating,
            updateDownloadableAppInfosFailed(),
        );
        expect(afterAbortingUpdating.isDownloadingLatestAppInfo).toBe(false);
    });

    it('has the date of the last update check', () => {
        const aDate = new Date(1972, 5, 27);

        const state = dispatchTo(reducer, [
            updateDownloadableAppInfosSuccess(aDate),
        ]);
        expect(state.lastUpdateCheckDate).toEqual(aDate);
    });
});
