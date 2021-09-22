/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer, remote } from 'electron';
import { join } from 'path';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import checkAppCompatibility from '../util/checkAppCompatibility';
import {
    EventAction,
    sendAppUsageData,
    sendLauncherUsageData,
} from './usageDataActions';

const net = remote.require('../main/net');
const fs = remote.require('fs-extra');

const mainApps = remote.require('../main/apps');
const config = remote.require('../main/config');
const settings = remote.require('../main/settings');

export const LOAD_LOCAL_APPS = 'LOAD_LOCAL_APPS';
export const LOAD_LOCAL_APPS_SUCCESS = 'LOAD_LOCAL_APPS_SUCCESS';
export const LOAD_LOCAL_APPS_ERROR = 'LOAD_LOCAL_APPS_ERROR';
export const LOAD_OFFICIAL_APPS = 'LOAD_OFFICIAL_APPS';
export const LOAD_OFFICIAL_APPS_SUCCESS = 'LOAD_OFFICIAL_APPS_SUCCESS';
export const LOAD_OFFICIAL_APPS_ERROR = 'LOAD_OFFICIAL_APPS_ERROR';
export const INSTALL_OFFICIAL_APP = 'INSTALL_OFFICIAL_APP';
export const INSTALL_OFFICIAL_APP_SUCCESS = 'INSTALL_OFFICIAL_APP_SUCCESS';
export const INSTALL_OFFICIAL_APP_ERROR = 'INSTALL_OFFICIAL_APP_ERROR';
export const REMOVE_OFFICIAL_APP = 'REMOVE_OFFICIAL_APP';
export const REMOVE_OFFICIAL_APP_SUCCESS = 'REMOVE_OFFICIAL_APP_SUCCESS';
export const REMOVE_OFFICIAL_APP_ERROR = 'REMOVE_OFFICIAL_APP_ERROR';
export const UPGRADE_OFFICIAL_APP = 'UPGRADE_OFFICIAL_APP';
export const UPGRADE_OFFICIAL_APP_SUCCESS = 'UPGRADE_OFFICIAL_APP_SUCCESS';
export const UPGRADE_OFFICIAL_APP_ERROR = 'UPGRADE_OFFICIAL_APP_ERROR';
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

function loadLocalAppsAction() {
    return {
        type: LOAD_LOCAL_APPS,
    };
}

function loadLocalAppsSuccess(apps) {
    return {
        type: LOAD_LOCAL_APPS_SUCCESS,
        apps,
    };
}

function loadLocalAppsError() {
    return {
        type: LOAD_LOCAL_APPS_ERROR,
    };
}

function loadOfficialAppsAction() {
    return {
        type: LOAD_OFFICIAL_APPS,
    };
}

function loadOfficialAppsSuccess(apps, appToUpdate) {
    return {
        type: LOAD_OFFICIAL_APPS_SUCCESS,
        apps,
        appToUpdate,
    };
}

function loadOfficialAppsError() {
    return {
        type: LOAD_OFFICIAL_APPS_ERROR,
    };
}

function installOfficialAppAction(name, source) {
    return {
        type: INSTALL_OFFICIAL_APP,
        name,
        source,
    };
}

function installOfficialAppSuccessAction(name, source) {
    return {
        type: INSTALL_OFFICIAL_APP_SUCCESS,
        name,
        source,
    };
}

function installOfficialAppErrorAction() {
    return {
        type: INSTALL_OFFICIAL_APP_ERROR,
    };
}

function removeOfficialAppAction(name, source) {
    return {
        type: REMOVE_OFFICIAL_APP,
        name,
        source,
    };
}

function removeOfficialAppSuccessAction(name, source) {
    return {
        type: REMOVE_OFFICIAL_APP_SUCCESS,
        name,
        source,
    };
}

function removeOfficialAppErrorAction() {
    return {
        type: REMOVE_OFFICIAL_APP_ERROR,
    };
}

function upgradeOfficialAppAction(name, version, source) {
    return {
        type: UPGRADE_OFFICIAL_APP,
        name,
        version,
        source,
    };
}

function upgradeOfficialAppSuccessAction(name, version, source) {
    return {
        type: UPGRADE_OFFICIAL_APP_SUCCESS,
        name,
        version,
        source,
    };
}

function upgradeOfficialAppErrorAction() {
    return {
        type: UPGRADE_OFFICIAL_APP_ERROR,
    };
}

export function downloadLatestAppInfoAction() {
    return {
        type: DOWNLOAD_LATEST_APP_INFO,
    };
}

export function downloadLatestAppInfoSuccessAction() {
    return {
        type: DOWNLOAD_LATEST_APP_INFO_SUCCESS,
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

export function setAppManagementShow(show = {}) {
    const newState = {
        installed: true,
        available: true,
        ...settings.get('app-management.show', {}),
        ...show,
    };
    settings.set('app-management.show', newState);
    return {
        type: SET_APP_MANAGEMENT_SHOW,
        show: newState,
    };
}

export function setAppManagementFilter(filter) {
    const newState =
        filter === undefined
            ? settings.get('app-management.filter', '')
            : filter;
    settings.set('app-management.filter', newState);
    return {
        type: SET_APP_MANAGEMENT_FILTER,
        filter: newState,
    };
}

export function setAppManagementSource(source, show) {
    const sources = { ...settings.get('app-management.sources', {}) };
    if (source) {
        if (show !== undefined) {
            sources[source] = show;
        } else {
            delete sources[source];
        }
    }
    settings.set('app-management.sources', sources);
    return {
        type: SET_APP_MANAGEMENT_SOURCE,
        sources,
    };
}

/**
 * Download app icon and dispatch icon update event
 *
 * @param {string} source app source identifier
 * @param {string} name app name
 * @param {string} iconPath path to store the icon at
 * @param {string} iconUrl url to download from
 *
 * @returns {void}
 */
function downloadAppIcon(source, name, iconPath, iconUrl) {
    return dispatch => {
        // If there is a cached version, use it even before downloading.
        if (fs.existsSync(iconPath)) {
            dispatch(setAppIconPath(source, name, iconPath));
        }
        net.downloadToFile(iconUrl, iconPath, false)
            .then(() => dispatch(setAppIconPath(source, name, iconPath)))
            .catch(() => {
                /* Ignore 404 not found. */
            });
    };
}

export function loadLocalApps() {
    return dispatch => {
        dispatch(loadLocalAppsAction());
        return mainApps
            .getLocalApps()
            .then(apps => dispatch(loadLocalAppsSuccess(apps)))
            .catch(error => {
                dispatch(loadLocalAppsError());
                dispatch(ErrorDialogActions.showDialog(error.message));
            });
    };
}

export function loadOfficialApps(appName, appSource) {
    return async dispatch => {
        dispatch(loadOfficialAppsAction());
        const { fulfilled: apps, rejected: appsWithErrors } =
            await mainApps.getOfficialApps();

        dispatch(
            loadOfficialAppsSuccess(
                apps,
                appName && { name: appName, source: appSource }
            )
        );
        apps.filter(({ path }) => !path).forEach(({ source, name, url }) => {
            const iconPath = join(
                `${config.getAppsRootDir(source)}`,
                `${name}.svg`
            );
            const iconUrl = `${url}.svg`;
            dispatch(downloadAppIcon(source, name, iconPath, iconUrl));
        });
        const downloadAllReleaseNotes = (app, ...rest) => {
            if (!app) {
                return Promise.resolve();
            }
            if (
                appName &&
                !(app.name === appName && app.source === appSource)
            ) {
                return downloadAllReleaseNotes(...rest);
            }
            return mainApps
                .downloadReleaseNotes(app)
                .then(
                    releaseNote =>
                        releaseNote &&
                        dispatch(
                            setAppReleaseNoteAction(
                                app.source,
                                app.name,
                                releaseNote
                            )
                        )
                )
                .then(() => downloadAllReleaseNotes(...rest));
        };
        downloadAllReleaseNotes(...apps);

        if (appsWithErrors.length > 0) {
            handleAppsWithErrors(dispatch, appsWithErrors);
        }
    };
}

const handleAppsWithErrors = (dispatch, apps) => {
    dispatch(loadOfficialAppsError());
    apps.forEach(app => {
        sendLauncherUsageData(
            EventAction.REPORT_INSTALLATION_ERROR,
            `${app.source} - ${app.name}`
        );
    });

    const recover = invalidPaths => () => {
        invalidPaths.forEach(p => fs.remove(p));
        remote.getCurrentWindow().reload();
    };

    dispatch(
        ErrorDialogActions.showDialog(buildErrorMessage(apps), {
            Recover: recover(apps.map(app => app.path)),
            Close: () => dispatch(ErrorDialogActions.hideDialog()),
        })
    );
};

const buildErrorMessage = apps => {
    const errors = apps.map(app => `* \`${app.reason}\`\n\n`).join('');
    const paths = apps.map(app => `* *${app.path}*\n\n`).join('');
    return `Unable to load all apps, these are the error messages:\n\n${errors}Clicking **Recover** will attempt to remove the following broken installation directories:\n\n${paths}`;
};

export function installOfficialApp(name, source) {
    return dispatch => {
        sendAppUsageData(EventAction.INSTALL_APP, source, name);
        dispatch(installOfficialAppAction(name, source));
        mainApps
            .installOfficialApp(name, 'latest', source)
            .then(() => {
                dispatch(installOfficialAppSuccessAction(name, source));
                dispatch(loadOfficialApps(name, source));
            })
            .catch(error => {
                dispatch(installOfficialAppErrorAction());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to install: ${error.message}`
                    )
                );
            });
    };
}

export function removeOfficialApp(name, source) {
    return dispatch => {
        sendAppUsageData(EventAction.REMOVE_APP, source, name);
        dispatch(removeOfficialAppAction(name, source));
        mainApps
            .removeOfficialApp(name, source)
            .then(() => {
                dispatch(removeOfficialAppSuccessAction(name, source));
                dispatch(loadOfficialApps(name, source));
            })
            .catch(error => {
                dispatch(removeOfficialAppErrorAction());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to remove: ${error.message}`
                    )
                );
            });
    };
}

export function upgradeOfficialApp(name, version, source) {
    return dispatch => {
        sendAppUsageData(EventAction.UPGRADE_APP, source, name);
        dispatch(upgradeOfficialAppAction(name, version, source));
        return mainApps
            .installOfficialApp(name, version, source)
            .then(() => {
                dispatch(
                    upgradeOfficialAppSuccessAction(name, version, source)
                );
                dispatch(loadOfficialApps(name, source));
            })
            .catch(error => {
                dispatch(upgradeOfficialAppErrorAction());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to upgrade: ${error.message}`
                    )
                );
            });
    };
}

export function launch(app) {
    // The apps in state are Immutable Maps which cannot be sent over IPC.
    // Converting to plain JS object before sending to the main process.
    const appObj = app.toJS();
    const sharedData =
        `App version: ${appObj.currentVersion};` +
        ` Engine version: ${appObj.engineVersion};`;
    sendAppUsageData(EventAction.LAUNCH_APP, sharedData, appObj.name);
    ipcRenderer.send('open-app', appObj);
}

export function checkEngineAndLaunch(app) {
    return dispatch => {
        const appCompatibility = checkAppCompatibility(app);
        const launchAppWithoutWarning =
            appCompatibility.isCompatible ||
            config.isRunningLauncherFromSource();

        if (launchAppWithoutWarning) {
            launch(app);
        } else {
            dispatch(
                showConfirmLaunchDialogAction(appCompatibility.longWarning, app)
            );
        }
    };
}
