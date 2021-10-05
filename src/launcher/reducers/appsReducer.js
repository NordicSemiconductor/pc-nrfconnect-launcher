/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { List, Record } from 'immutable';

import * as AppsActions from '../actions/appsActions';
import getImmutableApp from '../models';

const InitialState = Record({
    localApps: List(),
    officialApps: List(),
    isDownloadingLatestAppInfo: false,
    isLatestAppInfoDownloaded: false,
    lastUpdateCheckDate: null,
    isLoadingLocalApps: true,
    isLoadingOfficialApps: true,
    installingAppName: '',
    removingAppName: '',
    upgradingAppName: '',
    isConfirmLaunchDialogVisible: false,
    confirmLaunchText: '',
    confirmLaunchApp: null,
    show: { installed: true, available: true },
    filter: '',
    sources: {},
});
const initialState = new InitialState();

function setLocalApps(state, apps) {
    const immutableApps = apps.map(app => getImmutableApp(app));
    const newState = state.set('isLoadingLocalApps', false);
    return newState.set('localApps', List(immutableApps));
}

function setOfficialApps(state, apps) {
    const immutableApps = apps.map(app => getImmutableApp(app));
    return state
        .set('isLoadingOfficialApps', false)
        .set('officialApps', List(immutableApps));
}

function setOfficialApp(state, loadedApps, appToUpdate) {
    const findAppToUpdate = app =>
        app.source === appToUpdate.source && app.name === appToUpdate.name;

    return state
        .set('isLoadingOfficialApps', false)
        .update('officialApps', existingApps =>
            existingApps.set(
                existingApps.findKey(findAppToUpdate),
                getImmutableApp(loadedApps.find(findAppToUpdate))
            )
        );
}

function showConfirmLaunchDialog(state, text, app) {
    return state
        .set('confirmLaunchText', text)
        .set('confirmLaunchApp', app)
        .set('isConfirmLaunchDialogVisible', true);
}

function hideConfirmLaunchDialog(state) {
    return state
        .set('confirmLaunchText', initialState.confirmLaunchText)
        .set('confirmLaunchApp', initialState.app)
        .set(
            'isConfirmLaunchDialogVisible',
            initialState.isConfirmLaunchDialogVisible
        );
}

function setLatestAppInfoDownloaded(state) {
    return state
        .set('isLatestAppInfoDownloaded', true)
        .set('isDownloadingLatestAppInfo', false)
        .set('lastUpdateCheckDate', new Date());
}

function setAppIconPath(state, source, name, iconPath) {
    return state.update(
        state.findKey(x => x.source === source && x.name === name),
        x => x.merge({ iconPath })
    );
}

function setAppReleaseNote(state, source, name, releaseNote) {
    return state.update(
        state.findKey(x => x.source === source && x.name === name),
        x => x.merge({ releaseNote })
    );
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AppsActions.LOAD_LOCAL_APPS:
            return state.set('isLoadingLocalApps', true);
        case AppsActions.LOAD_OFFICIAL_APPS:
            return state.set('isLoadingOfficialApps', true);
        case AppsActions.LOAD_LOCAL_APPS_SUCCESS:
            return setLocalApps(state, action.apps);
        case AppsActions.LOAD_OFFICIAL_APPS_SUCCESS:
            return action.appToUpdate
                ? setOfficialApp(state, action.apps, action.appToUpdate)
                : setOfficialApps(state, action.apps);
        case AppsActions.LOAD_LOCAL_APPS_ERROR:
            return state.set('isLoadingLocalApps', false);
        case AppsActions.LOAD_OFFICIAL_APPS_ERROR:
            return state.set('isLoadingOfficialApps', false);
        case AppsActions.INSTALL_OFFICIAL_APP:
            return state.set(
                'installingAppName',
                `${action.source}/${action.name}`
            );
        case AppsActions.REMOVE_OFFICIAL_APP:
            return state.set(
                'removingAppName',
                `${action.source}/${action.name}`
            );
        case AppsActions.UPGRADE_OFFICIAL_APP:
            return state.set(
                'upgradingAppName',
                `${action.source}/${action.name}`
            );
        case AppsActions.INSTALL_OFFICIAL_APP_SUCCESS:
            return state.set(
                'installingAppName',
                initialState.installingAppName
            );
        case AppsActions.REMOVE_OFFICIAL_APP_SUCCESS:
            return state.set('removingAppName', initialState.removingAppName);
        case AppsActions.UPGRADE_OFFICIAL_APP_SUCCESS:
            return state.set('upgradingAppName', initialState.upgradingAppName);
        case AppsActions.INSTALL_OFFICIAL_APP_ERROR:
            return state.set(
                'installingAppName',
                initialState.installingAppName
            );
        case AppsActions.REMOVE_OFFICIAL_APP_ERROR:
            return state.set('removingAppName', initialState.removingAppName);
        case AppsActions.UPGRADE_OFFICIAL_APP_ERROR:
            return state.set('upgradingAppName', initialState.upgradingAppName);
        case AppsActions.SHOW_CONFIRM_LAUNCH_DIALOG:
            return showConfirmLaunchDialog(state, action.text, action.app);
        case AppsActions.HIDE_CONFIRM_LAUNCH_DIALOG:
            return hideConfirmLaunchDialog(state);
        case AppsActions.DOWNLOAD_LATEST_APP_INFO:
            return state.set('isDownloadingLatestAppInfo', true);
        case AppsActions.DOWNLOAD_LATEST_APP_INFO_SUCCESS:
            return setLatestAppInfoDownloaded(state);
        case AppsActions.DOWNLOAD_LATEST_APP_INFO_ERROR:
            return state.set('isDownloadingLatestAppInfo', false);
        case AppsActions.SET_APP_ICON_PATH:
            return state.update('officialApps', x =>
                setAppIconPath(x, action.source, action.name, action.iconPath)
            );
        case AppsActions.SET_APP_RELEASE_NOTE:
            return state.update('officialApps', x =>
                setAppReleaseNote(
                    x,
                    action.source,
                    action.name,
                    action.releaseNote
                )
            );
        case AppsActions.SET_APP_MANAGEMENT_SHOW:
            return state.set('show', action.show);
        case AppsActions.SET_APP_MANAGEMENT_FILTER:
            return state.set('filter', action.filter);
        case AppsActions.SET_APP_MANAGEMENT_SOURCE:
            return state.set('sources', action.sources);
        default:
            return state;
    }
};

export default reducer;
