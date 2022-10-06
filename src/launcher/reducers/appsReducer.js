/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { List, Record } from 'immutable';

import { allStandardSourceNames } from '../../ipc/sources';
import * as AppsActions from '../actions/appsActions';
import getImmutableApp from '../models';

const InitialState = Record({
    localApps: List(),
    downloadableApps: List(),
    isDownloadingLatestAppInfo: false,
    isLatestAppInfoDownloaded: false,
    lastUpdateCheckDate: null,
    isLoadingLocalApps: true,
    isLoadingDownloadableApps: true,
    installingAppName: '',
    removingAppName: '',
    upgradingAppName: '',
    isConfirmLaunchDialogVisible: false,
    confirmLaunchText: '',
    confirmLaunchApp: null,
});
const initialState = new InitialState();

function setLocalApps(state, apps) {
    const immutableApps = apps.map(app => getImmutableApp(app));
    const newState = state.set('isLoadingLocalApps', false);
    return newState.set('localApps', List(immutableApps));
}

function setDownloadableApps(state, apps) {
    const immutableApps = apps.map(app => getImmutableApp(app));
    return state
        .set('isLoadingDownloadableApps', false)
        .set('downloadableApps', List(immutableApps));
}

function setDownloadableApp(state, loadedApps, appToUpdate) {
    const findAppToUpdate = app =>
        app.source === appToUpdate.source && app.name === appToUpdate.name;

    return state
        .set('isLoadingDownloadableApps', false)
        .update('downloadableApps', existingApps =>
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

function setLatestAppInfoDownloaded(state, updateCheckDate) {
    return state
        .set('isLatestAppInfoDownloaded', true)
        .set('isDownloadingLatestAppInfo', false)
        .set('lastUpdateCheckDate', updateCheckDate);
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

// eslint-disable-next-line default-param-last -- Because this is a reducer, where this is the required signature
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AppsActions.LOAD_LOCAL_APPS:
            return state.set('isLoadingLocalApps', true);
        case AppsActions.LOAD_DOWNLOADABLE_APPS:
            return state.set('isLoadingDownloadableApps', true);
        case AppsActions.LOAD_LOCAL_APPS_SUCCESS:
            return setLocalApps(state, action.apps);
        case AppsActions.LOAD_DOWNLOADABLE_APPS_SUCCESS:
            return action.appToUpdate
                ? setDownloadableApp(state, action.apps, action.appToUpdate)
                : setDownloadableApps(state, action.apps);
        case AppsActions.LOAD_LOCAL_APPS_ERROR:
            return state.set('isLoadingLocalApps', false);
        case AppsActions.LOAD_DOWNLOADABLE_APPS_ERROR:
            return state.set('isLoadingDownloadableApps', false);
        case AppsActions.INSTALL_DOWNLOADABLE_APP:
            return state.set(
                'installingAppName',
                `${action.source}/${action.name}`
            );
        case AppsActions.REMOVE_DOWNLOADABLE_APP:
            return state.set(
                'removingAppName',
                `${action.source}/${action.name}`
            );
        case AppsActions.UPGRADE_DOWNLOADABLE_APP:
            return state.set(
                'upgradingAppName',
                `${action.source}/${action.name}`
            );
        case AppsActions.INSTALL_DOWNLOADABLE_APP_SUCCESS:
            return state.set(
                'installingAppName',
                initialState.installingAppName
            );
        case AppsActions.REMOVE_DOWNLOADABLE_APP_SUCCESS:
            return state
                .update('downloadableApps', downloadableApps =>
                    downloadableApps.update(
                        downloadableApps.findKey(
                            app =>
                                app.source === action.source &&
                                app.name === action.name
                        ),
                        app => app?.set('currentVersion', null)
                    )
                )
                .set('removingAppName', initialState.removingAppName);
        case AppsActions.UPGRADE_DOWNLOADABLE_APP_SUCCESS:
            return state.set('upgradingAppName', initialState.upgradingAppName);
        case AppsActions.INSTALL_DOWNLOADABLE_APP_ERROR:
            return state.set(
                'installingAppName',
                initialState.installingAppName
            );
        case AppsActions.REMOVE_DOWNLOADABLE_APP_ERROR:
            return state.set('removingAppName', initialState.removingAppName);
        case AppsActions.UPGRADE_DOWNLOADABLE_APP_ERROR:
            return state.set('upgradingAppName', initialState.upgradingAppName);
        case AppsActions.SHOW_CONFIRM_LAUNCH_DIALOG:
            return showConfirmLaunchDialog(state, action.text, action.app);
        case AppsActions.HIDE_CONFIRM_LAUNCH_DIALOG:
            return hideConfirmLaunchDialog(state);
        case AppsActions.DOWNLOAD_LATEST_APP_INFO:
            return state.set('isDownloadingLatestAppInfo', true);
        case AppsActions.DOWNLOAD_LATEST_APP_INFO_SUCCESS:
            return setLatestAppInfoDownloaded(state, action.updateCheckDate);
        case AppsActions.DOWNLOAD_LATEST_APP_INFO_ERROR:
            return state.set('isDownloadingLatestAppInfo', false);
        case AppsActions.SET_APP_ICON_PATH:
            return state.update('downloadableApps', x =>
                setAppIconPath(x, action.source, action.name, action.iconPath)
            );
        case AppsActions.SET_APP_RELEASE_NOTE:
            return state.update('downloadableApps', x =>
                setAppReleaseNote(
                    x,
                    action.source,
                    action.name,
                    action.releaseNote
                )
            );
        case AppsActions.UPDATE_DOWNLOAD_PROGRESS:
            return state.update('downloadableApps', appStates =>
                appStates.update(
                    appStates.findKey(
                        app =>
                            app.name === action.name &&
                            app.source === action.source
                    ),
                    app => app.set('progress', action.progressFraction)
                )
            );
        default:
            return state;
    }
};

export const getApps = state => state.apps;

const getAllApps = state => {
    const { downloadableApps, localApps } = state.apps;

    return localApps.concat(downloadableApps);
};

export const getAllSourceNamesSorted = state => {
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
    ({ source, name }) =>
    state =>
        state.apps.downloadableApps.find(
            x => x.source === source && x.name === name
        );

export default reducer;
