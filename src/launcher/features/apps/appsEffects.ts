/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow, require as remoteRequire } from '@electron/remote';
import { join } from 'path';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    AppWithError,
    DownloadableApp,
    downloadReleaseNotes,
    getDownloadableApps,
    getLocalApps,
    installDownloadableApp as installDownloadableAppInMain,
    LaunchableApp,
    removeDownloadableApp as removeDownloadableAppInMain,
} from '../../../ipc/apps';
import { downloadToFile } from '../../../ipc/downloadToFile';
import { openApp } from '../../../ipc/openWindow';
import { SourceName } from '../../../ipc/sources';
import { getAppsRootDir } from '../../../main/config';
import type { AppDispatch } from '../..';
import {
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
    setAppIconPath,
    setAppReleaseNoteAction,
    showConfirmLaunchDialogAction,
    upgradeDownloadableAppAction,
    upgradeDownloadableAppErrorAction,
    upgradeDownloadableAppSuccessAction,
} from '../../actions/appsActions';
import checkAppCompatibility from '../../util/checkAppCompatibility';
import mainConfig from '../../util/mainConfig';
import {
    EventAction,
    sendAppUsageData,
    sendLauncherUsageData,
} from '../usageData/usageDataEffects';

const fs = remoteRequire('fs-extra');

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
const downloadAppIcon =
    (source: string, name: string, iconPath: string, iconUrl: string) =>
    (dispatch: AppDispatch) => {
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

export const loadLocalApps = () => (dispatch: AppDispatch) => {
    dispatch(loadLocalAppsAction());

    return getLocalApps()
        .then(apps => dispatch(loadLocalAppsSuccess(apps)))
        .catch(error => {
            dispatch(loadLocalAppsError());
            dispatch(ErrorDialogActions.showDialog(error.message));
        });
};

const downloadAllReleaseNotesInBackground = async (
    dispatch: AppDispatch,
    apps: DownloadableApp[],
    appName?: string,
    appSource?: string
) => {
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
};

export const loadDownloadableApps =
    (appName?: string, appSource?: SourceName) =>
    async (dispatch: AppDispatch) => {
        dispatch(loadDownloadableAppsAction());
        const { apps, appsWithErrors } = await getDownloadableApps();

        dispatch(
            loadDownloadableAppsSuccess(
                apps,
                appName == null
                    ? undefined
                    : { name: appName, source: appSource! } // eslint-disable-line @typescript-eslint/no-non-null-assertion
            )
        );
        apps.filter(app => !app.isInstalled).forEach(
            ({ source, name, url }) => {
                const iconPath = join(
                    `${getAppsRootDir(source, mainConfig())}`,
                    `${name}.svg`
                );
                const iconUrl = `${url}.svg`;
                dispatch(downloadAppIcon(source, name, iconPath, iconUrl));
            }
        );

        downloadAllReleaseNotesInBackground(dispatch, apps, appName, appSource);

        if (appsWithErrors.length > 0) {
            handleAppsWithErrors(dispatch, appsWithErrors);
        }
    };

const handleAppsWithErrors = (dispatch: AppDispatch, apps: AppWithError[]) => {
    dispatch(loadDownloadableAppsError());
    apps.forEach(app => {
        sendLauncherUsageData(
            EventAction.REPORT_INSTALLATION_ERROR,
            `${app.source} - ${app.name}`
        );
    });

    const recover = (invalidPaths: string[]) => () => {
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

const buildErrorMessage = (apps: AppWithError[]) => {
    const errors = apps.map(app => `* \`${app.reason}\`\n\n`).join('');
    const paths = apps.map(app => `* *${app.path}*\n\n`).join('');
    return `Unable to load all apps, these are the error messages:\n\n${errors}Clicking **Recover** will attempt to remove the following broken installation directories:\n\n${paths}`;
};

export const installDownloadableApp =
    (name: string, source: SourceName) => (dispatch: AppDispatch) => {
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

export const removeDownloadableApp =
    (name: string, source: SourceName) => (dispatch: AppDispatch) => {
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

export const upgradeDownloadableApp =
    (name: string, version: string, source: SourceName) =>
    (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.UPGRADE_APP, source, name);
        dispatch(upgradeDownloadableAppAction(name, version, source));

        return installDownloadableAppInMain(name, version, source)
            .then(() => {
                dispatch(
                    upgradeDownloadableAppSuccessAction(name, version, source)
                );
                dispatch(loadDownloadableApps(name, source));
            })
            .catch(error => {
                dispatch(upgradeDownloadableAppErrorAction());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to upgrade: ${error.message}`
                    )
                );
            });
    };

export const launch = (app: LaunchableApp) => {
    // The apps in state are Immutable Maps which cannot be sent over IPC.
    // Converting to plain JS object before sending to the main process.
    const appObj = app;
    const sharedData =
        `App version: ${appObj.currentVersion};` +
        ` Engine version: ${appObj.engineVersion};`;
    sendAppUsageData(EventAction.LAUNCH_APP, sharedData, appObj.name);
    openApp(appObj);
};

export const checkEngineAndLaunch =
    (app: LaunchableApp) => (dispatch: AppDispatch) => {
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
