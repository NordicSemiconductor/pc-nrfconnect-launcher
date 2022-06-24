/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { require as remoteRequire } from '@electron/remote';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    invokeGetFromRenderer as getSetting,
    invokeGetSourcesFromRenderer as getSourcesSetting,
    sendSetFromRenderer as setSetting,
    sendSetSourcesFromRenderer as setSourcesSetting,
} from '../../ipc/settings';
import * as AppsActions from './appsActions';

const mainApps = remoteRequire('../main/apps');

export const SETTINGS_LOAD = 'SETTINGS_LOAD';
export const SETTINGS_LOAD_SUCCESS = 'SETTINGS_LOAD_SUCCESS';
export const SETTINGS_LOAD_ERROR = 'SETTINGS_LOAD_ERROR';
export const SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED =
    'SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED';
export const SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW =
    'SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW';
export const SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE =
    'SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE';
export const SETTINGS_SOURCE_ADDED = 'SETTINGS_SOURCE_ADDED';
export const SETTINGS_SOURCE_REMOVED = 'SETTINGS_SOURCE_REMOVED';
export const SETTINGS_ADD_SOURCE_DIALOG_SHOW =
    'SETTINGS_ADD_SOURCE_DIALOG_SHOW';
export const SETTINGS_ADD_SOURCE_DIALOG_HIDE =
    'SETTINGS_ADD_SOURCE_DIALOG_HIDE';
export const SETTINGS_REMOVE_SOURCE_DIALOG_SHOW =
    'SETTINGS_REMOVE_SOURCE_DIALOG_SHOW';
export const SETTINGS_REMOVE_SOURCE_DIALOG_HIDE =
    'SETTINGS_REMOVE_SOURCE_DIALOG_HIDE';

function loadSettingsAction() {
    return {
        type: SETTINGS_LOAD,
    };
}

function loadSettingsSuccessAction(settingsObj) {
    return {
        type: SETTINGS_LOAD_SUCCESS,
        settings: settingsObj,
    };
}

function loadSettingsErrorAction(error) {
    return {
        type: SETTINGS_LOAD_ERROR,
        error,
    };
}

function checkUpdatesAtStartupChangedAction(isEnabled) {
    return {
        type: SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED,
        isEnabled,
    };
}

export async function loadSettings(dispatch) {
    dispatch(loadSettingsAction());
    try {
        const shouldCheckForUpdatesAtStartup =
            (await getSetting('shouldCheckForUpdatesAtStartup')) ?? true;
        const sources = await getSourcesSetting();

        dispatch(
            loadSettingsSuccessAction({
                shouldCheckForUpdatesAtStartup,
                sources,
            })
        );
    } catch (error) {
        dispatch(loadSettingsErrorAction(error));
        dispatch(
            ErrorDialogActions.showDialog(
                `Unable to load settings: ${error.message}`
            )
        );
    }
}

export function checkUpdatesAtStartupChanged(isEnabled) {
    return dispatch => {
        dispatch(checkUpdatesAtStartupChangedAction(isEnabled));
        setSetting('shouldCheckForUpdatesAtStartup', isEnabled);
    };
}

export function showUpdateCheckCompleteDialog() {
    return {
        type: SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW,
    };
}

export function hideUpdateCheckCompleteDialog() {
    return {
        type: SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE,
    };
}

function addSourceAction(name, url) {
    return {
        type: SETTINGS_SOURCE_ADDED,
        name,
        url,
    };
}

export function addSource(url) {
    return (dispatch, getState) => {
        mainApps
            .downloadAppsJsonFile(url)
            .then(source => dispatch(addSourceAction(source, url)))
            .then(() => {
                setSourcesSetting(getState().settings.sources.toJS());
            })
            .catch(error =>
                dispatch(ErrorDialogActions.showDialog(error.message))
            )
            .then(() => dispatch(AppsActions.loadOfficialApps()));
    };
}

function sourceRemovedAction(name) {
    return {
        type: SETTINGS_SOURCE_REMOVED,
        name,
    };
}

export function removeSource(name) {
    return (dispatch, getState) => {
        mainApps
            .removeSourceDirectory(name)
            .then(() => dispatch(sourceRemovedAction(name)))
            .then(() => {
                setSourcesSetting(getState().settings.sources.toJS());
            })
            .then(() => dispatch(AppsActions.loadOfficialApps()))
            .then(async () =>
                dispatch(await AppsActions.setAppManagementSource(name))
            );
    };
}

export function showAddSourceDialog() {
    return {
        type: SETTINGS_ADD_SOURCE_DIALOG_SHOW,
    };
}

export function hideAddSourceDialog() {
    return {
        type: SETTINGS_ADD_SOURCE_DIALOG_HIDE,
    };
}

export function showRemoveSourceDialog(name) {
    return {
        type: SETTINGS_REMOVE_SOURCE_DIALOG_SHOW,
        name,
    };
}

export function hideRemoveSourceDialog() {
    return {
        type: SETTINGS_REMOVE_SOURCE_DIALOG_HIDE,
    };
}
