/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { join } from 'path';
import { ipcRenderer, remote } from 'electron';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';
import { sendAppUsageData, EventAction } from './usageDataActions';

const net = remote.require('../main/net');
const fs = remote.require('fs');

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
    return dispatch => {
        dispatch(loadOfficialAppsAction());
        return mainApps
            .getOfficialApps()
            .then(apps => {
                dispatch(
                    loadOfficialAppsSuccess(
                        apps,
                        appName && { name: appName, source: appSource }
                    )
                );
                apps.filter(({ path }) => !path).forEach(
                    ({ source, name, url }) => {
                        const iconPath = join(
                            `${config.getAppsRootDir(source)}`,
                            `${name}.svg`
                        );
                        const iconUrl = `${url}.svg`;
                        dispatch(
                            downloadAppIcon(source, name, iconPath, iconUrl)
                        );
                    }
                );
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
            })
            .catch(error => {
                dispatch(loadOfficialAppsError());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to load apps: ${error.message}`
                    )
                );
            });
    };
}

export function installOfficialApp(name, source) {
    return dispatch => {
        dispatch(sendAppUsageData(EventAction.INSTALL_APP, source, name));
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
        dispatch(sendAppUsageData(EventAction.REMOVE_APP, source, name));
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
        dispatch(sendAppUsageData(EventAction.UPGRADE_APP, source, name));
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
    return dispatch => {
        // The apps in state are Immutable Maps which cannot be sent over IPC.
        // Converting to plain JS object before sending to the main process.
        const appObj = app.toJS();
        const sharedData =
            `App version: ${appObj.currentVersion};` +
            ` Engine version: ${appObj.engineVersion};`;
        dispatch(
            sendAppUsageData(EventAction.LAUNCH_APP, sharedData, appObj.name)
        );
        ipcRenderer.send('open-app', appObj);
    };
}

export function checkEngineAndLaunch(app) {
    return dispatch => {
        if (!app.engineVersion) {
            dispatch(
                showConfirmLaunchDialogAction(
                    'The app does not specify ' +
                        'which nRF Connect version(s) it supports. Ask the app ' +
                        'author to add an engines.nrfconnect definition to package.json, ' +
                        'ref. the documentation.',
                    app
                )
            );
        } else if (!app.isSupportedEngine) {
            dispatch(
                showConfirmLaunchDialogAction(
                    'The app only supports ' +
                        `nRF Connect ${app.engineVersion} while your installed version ` +
                        `is ${config.getVersion()}. It might not work as expected.`,
                    app
                )
            );
        } else {
            dispatch(launch(app));
        }
    };
}
