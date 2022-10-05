/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const LOAD_LOCAL_APPS = 'LOAD_LOCAL_APPS';
export const LOAD_LOCAL_APPS_SUCCESS = 'LOAD_LOCAL_APPS_SUCCESS';
export const LOAD_LOCAL_APPS_ERROR = 'LOAD_LOCAL_APPS_ERROR';
export const LOAD_DOWNLOADABLE_APPS = 'LOAD_DOWNLOADABLE_APPS';
export const LOAD_DOWNLOADABLE_APPS_SUCCESS = 'LOAD_DOWNLOADABLE_APPS_SUCCESS';
export const LOAD_DOWNLOADABLE_APPS_ERROR = 'LOAD_DOWNLOADABLE_APPS_ERROR';
export const INSTALL_DOWNLOADABLE_APP = 'INSTALL_DOWNLOADABLE_APP';
export const INSTALL_DOWNLOADABLE_APP_SUCCESS =
    'INSTALL_DOWNLOADABLE_APP_SUCCESS';
export const INSTALL_DOWNLOADABLE_APP_ERROR = 'INSTALL_DOWNLOADABLE_APP_ERROR';
export const REMOVE_DOWNLOADABLE_APP = 'REMOVE_DOWNLOADABLE_APP';
export const REMOVE_DOWNLOADABLE_APP_SUCCESS =
    'REMOVE_DOWNLOADABLE_APP_SUCCESS';
export const REMOVE_DOWNLOADABLE_APP_ERROR = 'REMOVE_DOWNLOADABLE_APP_ERROR';
export const UPGRADE_DOWNLOADABLE_APP = 'UPGRADE_DOWNLOADABLE_APP';
export const UPGRADE_DOWNLOADABLE_APP_SUCCESS =
    'UPGRADE_DOWNLOADABLE_APP_SUCCESS';
export const UPGRADE_DOWNLOADABLE_APP_ERROR = 'UPGRADE_DOWNLOADABLE_APP_ERROR';
export const SHOW_CONFIRM_LAUNCH_DIALOG = 'SHOW_CONFIRM_LAUNCH_DIALOG';
export const HIDE_CONFIRM_LAUNCH_DIALOG = 'HIDE_CONFIRM_LAUNCH_DIALOG';
export const DOWNLOAD_LATEST_APP_INFO = 'DOWNLOAD_LATEST_APP_INFO';
export const DOWNLOAD_LATEST_APP_INFO_SUCCESS =
    'DOWNLOAD_LATEST_APP_INFO_SUCCESS';
export const DOWNLOAD_LATEST_APP_INFO_ERROR = 'DOWNLOAD_LATEST_APP_INFO_ERROR';
export const SET_APP_ICON_PATH = 'SET_APP_ICON_PATH';
export const SET_APP_RELEASE_NOTE = 'SET_APP_RELEASE_NOTE';
export const SET_APP_MANAGEMENT_SHOW = 'SET_APP_MANAGEMENT_SHOW';
export const SET_APP_MANAGEMENT_FILTER = 'SET_APP_MANAGEMENT_FILTER';
export const SET_APP_MANAGEMENT_SOURCE = 'SET_APP_MANAGEMENT_SOURCE';
export const UPDATE_DOWNLOAD_PROGRESS = 'UPDATE_DOWNLOAD_PROGRESS';

export function loadLocalAppsAction() {
    return {
        type: LOAD_LOCAL_APPS,
    };
}

export function loadLocalAppsSuccess(apps) {
    return {
        type: LOAD_LOCAL_APPS_SUCCESS,
        apps,
    };
}

export function loadLocalAppsError() {
    return {
        type: LOAD_LOCAL_APPS_ERROR,
    };
}

export function loadDownloadableAppsAction() {
    return {
        type: LOAD_DOWNLOADABLE_APPS,
    };
}

export function loadDownloadableAppsSuccess(apps, appToUpdate) {
    return {
        type: LOAD_DOWNLOADABLE_APPS_SUCCESS,
        apps,
        appToUpdate,
    };
}

export function loadDownloadableAppsError() {
    return {
        type: LOAD_DOWNLOADABLE_APPS_ERROR,
    };
}

export function installDownloadableAppAction(name, source) {
    return {
        type: INSTALL_DOWNLOADABLE_APP,
        name,
        source,
    };
}

export function installDownloadableAppSuccessAction(name, source) {
    return {
        type: INSTALL_DOWNLOADABLE_APP_SUCCESS,
        name,
        source,
    };
}

export function installDownloadableAppErrorAction() {
    return {
        type: INSTALL_DOWNLOADABLE_APP_ERROR,
    };
}

export function updateInstallProgressAction(message) {
    return {
        type: UPDATE_DOWNLOAD_PROGRESS,
        ...message,
    };
}

export function removeDownloadableAppAction(name, source) {
    return {
        type: REMOVE_DOWNLOADABLE_APP,
        name,
        source,
    };
}

export function removeDownloadableAppSuccessAction(name, source) {
    return {
        type: REMOVE_DOWNLOADABLE_APP_SUCCESS,
        name,
        source,
    };
}

export function removeDownloadableAppErrorAction() {
    return {
        type: REMOVE_DOWNLOADABLE_APP_ERROR,
    };
}

export function upgradeDownloadableAppAction(name, version, source) {
    return {
        type: UPGRADE_DOWNLOADABLE_APP,
        name,
        version,
        source,
    };
}

export function upgradeDownloadableAppSuccessAction(name, version, source) {
    return {
        type: UPGRADE_DOWNLOADABLE_APP_SUCCESS,
        name,
        version,
        source,
    };
}

export function upgradeDownloadableAppErrorAction() {
    return {
        type: UPGRADE_DOWNLOADABLE_APP_ERROR,
    };
}

export function downloadLatestAppInfoAction() {
    return {
        type: DOWNLOAD_LATEST_APP_INFO,
    };
}

export function downloadLatestAppInfoSuccessAction(
    updateCheckDate = new Date()
) {
    return {
        type: DOWNLOAD_LATEST_APP_INFO_SUCCESS,
        updateCheckDate,
    };
}

export function downloadLatestAppInfoErrorAction() {
    return {
        type: DOWNLOAD_LATEST_APP_INFO_ERROR,
    };
}

export function showConfirmLaunchDialogAction(text, app) {
    return {
        type: SHOW_CONFIRM_LAUNCH_DIALOG,
        text,
        app,
    };
}

export function hideConfirmLaunchDialogAction() {
    return {
        type: HIDE_CONFIRM_LAUNCH_DIALOG,
    };
}

export function setAppIconPath(source, name, iconPath) {
    return {
        type: SET_APP_ICON_PATH,
        source,
        name,
        iconPath,
    };
}

export function setAppReleaseNoteAction(source, name, releaseNote) {
    return {
        type: SET_APP_RELEASE_NOTE,
        source,
        name,
        releaseNote,
    };
}
