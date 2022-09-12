/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow, require as remoteRequire } from '@electron/remote';
import { join } from 'path';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    downloadReleaseNotes,
    getDownloadableApps,
    getLocalApps,
    installDownloadableApp as installDownloadableAppInMain,
    removeDownloadableApp as removeDownloadableAppInMain,
} from '../../ipc/apps';
import { downloadToFile } from '../../ipc/downloadToFile';
import { openApp } from '../../ipc/openWindow';
import { getSetting, setSetting } from '../../ipc/settings';
import { getAppsRootDir } from '../../main/config';
import checkAppCompatibility from '../util/checkAppCompatibility';
import mainConfig from '../util/mainConfig';
import {
    EventAction,
    sendAppUsageData,
    sendLauncherUsageData,
} from './usageDataActions';

const fs = remoteRequire('fs-extra');

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
export const UPDATE_DOWNLOAD_PROGRESS = 'UPDATE_DOWNLOAD_PROGRESS';

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

function loadDownloadableAppsAction() {
    return {
        type: LOAD_DOWNLOADABLE_APPS,
    };
}

function loadDownloadableAppsSuccess(apps, appToUpdate) {
    return {
        type: LOAD_DOWNLOADABLE_APPS_SUCCESS,
        apps,
        appToUpdate,
    };
}

function loadDownloadableAppsError() {
    return {
        type: LOAD_DOWNLOADABLE_APPS_ERROR,
    };
}

function installDownloadableAppAction(name, source) {
    return {
        type: INSTALL_DOWNLOADABLE_APP,
        name,
        source,
    };
}

function installDownloadableAppSuccessAction(name, source) {
    return {
        type: INSTALL_DOWNLOADABLE_APP_SUCCESS,
        name,
        source,
    };
}

function installDownloadableAppErrorAction() {
    return {
        type: INSTALL_DOWNLOADABLE_APP_ERROR,
    };
}

function updateInstallProgressAction(message) {
    return {
        type: UPDATE_DOWNLOAD_PROGRESS,
        ...message,
    };
}

function removeDownloadableAppAction(name, source) {
    return {
        type: REMOVE_DOWNLOADABLE_APP,
        name,
        source,
    };
}

function removeDownloadableAppSuccessAction(name, source) {
    return {
        type: REMOVE_DOWNLOADABLE_APP_SUCCESS,
        name,
        source,
    };
}

function removeDownloadableAppErrorAction() {
    return {
        type: REMOVE_DOWNLOADABLE_APP_ERROR,
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

export async function setAppManagementShow(show = {}) {
    const previousSetting = await getSetting('app-management.show', {});

    const newState = {
        installed: true,
        available: true,
        ...previousSetting,
        ...show,
    };
    setSetting('app-management.show', newState);
    return {
        type: SET_APP_MANAGEMENT_SHOW,
        show: newState,
    };
}

export async function setAppManagementFilter(filter) {
    const newState =
        filter === undefined
            ? await getSetting('app-management.filter', '')
            : filter;
    setSetting('app-management.filter', newState);
    return {
        type: SET_APP_MANAGEMENT_FILTER,
        filter: newState,
    };
}

export async function setAppManagementSource(source, show) {
    const sources = await getSetting('app-management.sources', {});
    if (source) {
        if (show !== undefined) {
            sources[source] = show;
        } else {
            delete sources[source];
        }
    }
    setSetting('app-management.sources', sources);
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
        downloadToFile(iconUrl, iconPath)
            .then(() => dispatch(setAppIconPath(source, name, iconPath)))
            .catch(() => {
                /* Ignore 404 not found. */
            });
    };
}

export function loadLocalApps() {
    return dispatch => {
        dispatch(loadLocalAppsAction());

        return getLocalApps()
            .then(apps => dispatch(loadLocalAppsSuccess(apps)))
            .catch(error => {
                dispatch(loadLocalAppsError());
                dispatch(ErrorDialogActions.showDialog(error.message));
            });
    };
}

async function downloadAllReleaseNotesInBackground(
    dispatch,
    apps,
    appName,
    appSource
) {
    // eslint-disable-next-line no-restricted-syntax
    for (const app of apps) {
        if (appName && !(app.name === appName && app.source === appSource)) {
            // eslint-disable-next-line no-continue
            continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const releaseNote = await downloadReleaseNotes(app);
        if (releaseNote != null) {
            dispatch(
                setAppReleaseNoteAction(app.source, app.name, releaseNote)
            );
        }
    }
}

export function loadDownloadableApps(appName, appSource) {
    return async dispatch => {
        dispatch(loadDownloadableAppsAction());
        const { apps, appsWithErrors } = await getDownloadableApps();

        dispatch(
            loadDownloadableAppsSuccess(
                apps,
                appName && { name: appName, source: appSource }
            )
        );
        apps.filter(({ path }) => !path).forEach(({ source, name, url }) => {
            const iconPath = join(
                `${getAppsRootDir(source, mainConfig())}`,
                `${name}.svg`
            );
            const iconUrl = `${url}.svg`;
            dispatch(downloadAppIcon(source, name, iconPath, iconUrl));
        });

        downloadAllReleaseNotesInBackground(dispatch, apps, appName, appSource);

        if (appsWithErrors.length > 0) {
            handleAppsWithErrors(dispatch, appsWithErrors);
        }
    };
}

const handleAppsWithErrors = (dispatch, apps) => {
    dispatch(loadDownloadableAppsError());
    apps.forEach(app => {
        sendLauncherUsageData(
            EventAction.REPORT_INSTALLATION_ERROR,
            `${app.source} - ${app.name}`
        );
    });

    const recover = invalidPaths => () => {
        invalidPaths.forEach(p => fs.remove(p));
        getCurrentWindow().reload();
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

export function installDownloadableApp(name, source) {
    return dispatch => {
        sendAppUsageData(EventAction.INSTALL_APP, source, name);
        dispatch(installDownloadableAppAction(name, source));

        installDownloadableAppInMain(name, 'latest', source)
            .then(() => {
                dispatch(installDownloadableAppSuccessAction(name, source));
                dispatch(loadDownloadableApps(name, source));
            })
            .catch(error => {
                dispatch(installDownloadableAppErrorAction());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to install: ${error.message}`
                    )
                );
            });
    };
}

export function updateInstallProgress(message) {
    return dispatch => {
        dispatch(updateInstallProgressAction(...message));
    };
}

export function removeDownloadableApp(name, source) {
    return dispatch => {
        sendAppUsageData(EventAction.REMOVE_APP, source, name);
        dispatch(removeDownloadableAppAction(name, source));
        removeDownloadableAppInMain(name, source)
            .then(() => {
                dispatch(removeDownloadableAppSuccessAction(name, source));
            })
            .catch(error => {
                dispatch(removeDownloadableAppErrorAction());
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

        return installDownloadableAppInMain(name, version, source)
            .then(() => {
                dispatch(
                    upgradeOfficialAppSuccessAction(name, version, source)
                );
                dispatch(loadDownloadableApps(name, source));
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
    openApp(appObj);
}

export function checkEngineAndLaunch(app) {
    return dispatch => {
        const appCompatibility = checkAppCompatibility(app);
        const launchAppWithoutWarning =
            appCompatibility.isCompatible ||
            mainConfig().isRunningLauncherFromSource;

        if (launchAppWithoutWarning) {
            launch(app);
        } else {
            dispatch(
                showConfirmLaunchDialogAction(appCompatibility.longWarning, app)
            );
        }
    };
}
