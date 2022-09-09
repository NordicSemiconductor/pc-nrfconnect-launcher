/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// @ts-check

import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import { cleanIpcErrorMessage } from '../../ipc/error';
import { getSetting, setSetting } from '../../ipc/settings';
import {
    addSource as addSourceInMain,
    getSources,
    removeSource as removeSourceInMain,
} from '../../ipc/sources';
import * as AppsActions from './appsActions';

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
        const sources = await getSources();

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
    return dispatch => {
        addSourceInMain(url)
            .then(source => dispatch(addSourceAction(source, url)))
            .catch(error =>
                dispatch(
                    ErrorDialogActions.showDialog(
                        cleanIpcErrorMessage(
                            error.message,
                            'Error while trying to add a source: '
                        )
                    )
                )
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
    return dispatch => {
        removeSourceInMain(name)
            .then(() => dispatch(sourceRemovedAction(name)))
            .then(() => dispatch(AppsActions.loadOfficialApps()))
            .then(async () =>
                dispatch(await AppsActions.setAppManagementSource(name))
            )
            .catch(error =>
                dispatch(
                    ErrorDialogActions.showDialog(
                        cleanIpcErrorMessage(
                            error.message,
                            `Error while trying to remove the source '${name}': `
                        )
                    )
                )
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
