/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from 'pc-nrfconnect-shared/test/dispatchTo';

import * as AppsActions from '../actions/appsActions';
import {
    downloadLatestAppInfoAction,
    downloadLatestAppInfoErrorAction,
    downloadLatestAppInfoSuccessAction,
    hideConfirmLaunchDialogAction,
    installDownloadableAppAction,
    installDownloadableAppErrorAction,
    installDownloadableAppSuccessAction,
    loadDownloadableAppsAction,
    loadDownloadableAppsError,
    loadDownloadableAppsSuccess,
    loadLocalAppsAction,
    loadLocalAppsError,
    loadLocalAppsSuccess,
    removeDownloadableAppAction,
    removeDownloadableAppErrorAction,
    removeDownloadableAppSuccessAction,
    showConfirmLaunchDialogAction,
    upgradeDownloadableAppAction,
    upgradeDownloadableAppErrorAction,
    upgradeDownloadableAppSuccessAction,
} from '../actions/appsActions';
import rootReducer from '.';
import reducer, { getAllSourceNamesSorted } from './appsReducer';

const app1 = {
    name: 'pc-nrfconnect-foo',
    displayName: 'Foo app',
    currentVersion: '1.2.3',
    description: 'Foo description',
    path: '/path/to/app',
    iconPath: './path/to/icon.png',
    engineVersion: null,
    homepage: null,
    isDownloadable: null,
    latestVersion: null,
    shortcutIconPath: null,
    source: null,
    upgradeAvailable: null,
    url: null,
    releaseNote: null,
    repositoryUrl: null,
    progress: null,
    isInstalled: true,
};
const app2 = {
    name: 'pc-nrfconnect-bar',
    displayName: 'Bar app',
    currentVersion: '1.2.4',
    description: null,
    path: null,
    iconPath: null,
    engineVersion: null,
    homepage: null,
    isDownloadable: null,
    latestVersion: null,
    shortcutIconPath: null,
    source: null,
    upgradeAvailable: null,
    url: null,
    releaseNote: null,
    repositoryUrl: null,
    progress: null,
    isInstalled: false,
};

const initAction = {
    type: '@@INIT',
};

const initialState = dispatchTo(reducer, [initAction]);

describe('appsReducer', () => {
    it('should have no apps in initial state', () => {
        expect(initialState.localApps.toJS().length).toEqual(0);
        expect(initialState.downloadableApps.toJS().length).toEqual(0);
    });

    it('should be loading apps in initial state', () => {
        expect(initialState.isLoadingLocalApps).toEqual(true);
        expect(initialState.isLoadingDownloadableApps).toEqual(true);
    });

    it('should be loading local apps after loadLocalAppsAction has been dispatched', () => {
        const state = dispatchTo(reducer, [loadLocalAppsAction()]);
        expect(state.isLoadingLocalApps).toEqual(true);
    });

    it('should have local apps when loadLocalAppsSuccess has been dispatched with apps', () => {
        const state = dispatchTo(reducer, [loadLocalAppsSuccess([app1, app2])]);
        expect(state.localApps.get(0).toJS()).toEqual(app1);
        expect(state.localApps.get(1).toJS()).toEqual(app2);
    });

    it('should not be loading local apps after loadLocalAppsSuccess has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadLocalAppsAction(),
            loadLocalAppsSuccess([]),
        ]);
        expect(state.isLoadingLocalApps).toEqual(false);
    });

    it('should not be loading local apps after loadLocalAppsError has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadLocalAppsAction(),
            loadLocalAppsError(),
        ]);
        expect(state.isLoadingLocalApps).toEqual(false);
    });

    it('should be loading downloadable apps after loadDownloadableAppsAction has been dispatched', () => {
        const state = dispatchTo(reducer, [loadDownloadableAppsAction()]);
        expect(state.isLoadingDownloadableApps).toEqual(true);
    });

    it('should have downloadable apps when loadDownloadableAppsSuccess has been dispatched with apps', () => {
        const state = dispatchTo(reducer, [
            loadDownloadableAppsSuccess([app1, app2]),
        ]);
        expect(state.downloadableApps.get(0).toJS()).toEqual(app1);
        expect(state.downloadableApps.get(1).toJS()).toEqual(app2);
    });

    it('should not be loading downloadable apps after loadDownloadableAppsSuccess has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadDownloadableAppsAction(),
            loadDownloadableAppsSuccess([]),
        ]);
        expect(state.isLoadingDownloadableApps).toEqual(false);
    });

    it('should not be loading downloadable apps after loadDownloadableAppsError has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loadDownloadableAppsAction(),
            loadDownloadableAppsError(),
        ]);
        expect(state.isLoadingDownloadableApps).toEqual(false);
    });

    it('should be installing app after installDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            installDownloadableAppAction('pc-nrfconnect-foo', 'bar'),
        ]);
        expect(state.installingAppName).toEqual('bar/pc-nrfconnect-foo');
    });

    it('should not be installing app after installDownloadableAppSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            installDownloadableAppAction('pc-nrfconnect-foo', 'bar'),
            installDownloadableAppSuccessAction('pc-nrfconnect-foo', 'bar'),
        ]);
        expect(state.installingAppName).toEqual(initialState.installingAppName);
    });

    it('should not be installing app after installDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            installDownloadableAppAction('pc-nrfconnect-foo', 'bar'),
            installDownloadableAppErrorAction(),
        ]);
        expect(state.installingAppName).toEqual(initialState.installingAppName);
    });

    it('should be removing app after removeDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            removeDownloadableAppAction('pc-nrfconnect-foo', 'bar'),
        ]);
        expect(state.removingAppName).toEqual('bar/pc-nrfconnect-foo');
    });

    it('should not be removing app after removeDownloadableAppSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            removeDownloadableAppAction('pc-nrfconnect-foo', 'bar'),
            removeDownloadableAppSuccessAction('pc-nrfconnect-foo', 'bar'),
        ]);
        expect(state.removingAppName).toEqual(initialState.removingAppName);
    });

    it('should not be removing app after removeDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            removeDownloadableAppAction('pc-nrfconnect-foo', 'bar'),
            removeDownloadableAppErrorAction(),
        ]);
        expect(state.removingAppName).toEqual(initialState.removingAppName);
    });

    it('should be upgrading app after upgradeDownloadableAppAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            upgradeDownloadableAppAction('pc-nrfconnect-foo', '1.2.3', 'bar'),
        ]);
        expect(state.upgradingAppName).toEqual('bar/pc-nrfconnect-foo');
    });

    it('should not be upgrading app after upgradeDownloadableAppSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            upgradeDownloadableAppAction('pc-nrfconnect-foo', '1.2.3', 'bar'),
            upgradeDownloadableAppSuccessAction(
                'pc-nrfconnect-foo',
                '1.2.3',
                'bar'
            ),
        ]);
        expect(state.upgradingAppName).toEqual(initialState.upgradingAppName);
    });

    it('should not be removing app after upgradeDownloadableAppErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            upgradeDownloadableAppAction('pc-nrfconnect-foo', '1.2.3', 'bar'),
            upgradeDownloadableAppErrorAction(),
        ]);
        expect(state.upgradingAppName).toEqual(initialState.upgradingAppName);
    });

    it('should show confirm dialog when showConfirmLaunchDialogAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialogAction('Do you confirm?', app1),
        ]);
        expect(state.isConfirmLaunchDialogVisible).toEqual(true);
    });

    it('should add text to state when showConfirmLaunchDialogAction has been dispatched with text', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialogAction('Do you confirm?', app1),
        ]);
        expect(state.confirmLaunchText).toEqual('Do you confirm?');
    });

    it('should add app to state when showConfirmLaunchDialogAction has been dispatched with app', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialogAction('Do you confirm?', app1),
        ]);
        expect(state.confirmLaunchApp).toEqual(app1);
    });

    it('should hide confirm dialog when hideConfirmLaunchDialogAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            showConfirmLaunchDialogAction('Do you confirm?', app1),
            hideConfirmLaunchDialogAction(),
        ]);
        expect(state.isConfirmLaunchDialogVisible).toEqual(false);
    });

    it('should be downloading latest app info when downloadLatestAppInfoAction has been dispatched', () => {
        const state = dispatchTo(reducer, [downloadLatestAppInfoAction()]);
        expect(state.isDownloadingLatestAppInfo).toEqual(true);
    });

    it('should not be downloading latest app info when downloadLatestAppInfoSuccessAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            downloadLatestAppInfoAction(),
            downloadLatestAppInfoSuccessAction(),
        ]);
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should not be downloading latest app info when downloadLatestAppInfoErrorAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            downloadLatestAppInfoAction(),
            downloadLatestAppInfoErrorAction(),
        ]);
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should set a last update check date when downloadLatestAppInfoSuccessAction has been dispatched', () => {
        const aDate = new Date(1972, 5, 27);

        const state = dispatchTo(reducer, [
            downloadLatestAppInfoSuccessAction(aDate),
        ]);
        expect(state.lastUpdateCheckDate).toEqual(aDate);
    });
});

test('sortedSources sorts the sources into official, local and then the rest in alphabetical order', () => {
    const state = dispatchTo(rootReducer, [
        AppsActions.loadDownloadableAppsSuccess([
            { ...app1, source: 'OtherB' },
            { ...app1, source: 'official' },
            { ...app2, source: 'OtherA' },
        ]),
    ]);

    expect(getAllSourceNamesSorted(state)).toStrictEqual([
        'official',
        'local',
        'OtherA',
        'OtherB',
    ]);
});
