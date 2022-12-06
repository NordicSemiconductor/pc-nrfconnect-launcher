/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow, require as remoteRequire } from '@electron/remote';
import { describeError, ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    AppSpec,
    AppWithError,
    DownloadableApp,
    DownloadableAppInfo,
    downloadAppIcon as downloadAppIconInMain,
    downloadReleaseNotes as downloadReleaseNotesInMain,
    getDownloadableApps,
    getLocalApps,
    installDownloadableApp as installDownloadableAppInMain,
    installLocalApp as installLocalAppInMain,
    isInstalled,
    LaunchableApp,
    removeDownloadableApp as removeDownloadableAppInMain,
    removeLocalApp as removeLocalAppInMain,
} from '../../../ipc/apps';
import { openApp } from '../../../ipc/openWindow';
import type { AppDispatch } from '../../store';
import appCompatibilityWarning from '../../util/appCompatibilityWarning';
import mainConfig from '../../util/mainConfig';
import {
    EventAction,
    sendAppUsageData,
    sendLauncherUsageData,
} from '../usageData/usageDataEffects';
import {
    addLocalApp,
    installDownloadableAppStarted,
    loadDownloadableAppsError,
    loadDownloadableAppsStarted,
    loadLocalAppsError,
    loadLocalAppsStarted,
    loadLocalAppsSuccess,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    removeLocalApp,
    resetAppProgress,
    setAllDownloadableApps,
    setAppIconPath,
    setAppReleaseNote,
    showConfirmLaunchDialog,
    updateDownloadableAppInfo,
    updateDownloadableAppStarted,
} from './appsSlice';

const fs = remoteRequire('fs-extra');

export const loadLocalApps = () => (dispatch: AppDispatch) => {
    dispatch(loadLocalAppsStarted());

    return getLocalApps()
        .then(apps => dispatch(loadLocalAppsSuccess(apps)))
        .catch(error => {
            dispatch(loadLocalAppsError());
            dispatch(ErrorDialogActions.showDialog(error.message));
        });
};

const downloadAppIcon =
    (app: DownloadableApp) => async (dispatch: AppDispatch) => {
        const iconPath = await downloadAppIconInMain(app);
        if (iconPath != null) {
            dispatch(setAppIconPath({ app, iconPath }));
        }
    };

const downloadReleaseNotes =
    (app: DownloadableApp) => async (dispatch: AppDispatch) => {
        const releaseNote = await downloadReleaseNotesInMain(app);
        if (releaseNote != null) {
            dispatch(setAppReleaseNote({ app, releaseNote }));
        }
    };

export const fetchInfoForAllDownloadableApps =
    (checkOnlineForUpdates = true) =>
    async (dispatch: AppDispatch) => {
        dispatch(loadDownloadableAppsStarted());
        const { apps, appsWithErrors } = await getDownloadableApps();

        dispatch(setAllDownloadableApps(apps));

        if (checkOnlineForUpdates) {
            apps.forEach(app => {
                dispatch(downloadReleaseNotes(app));
                if (!isInstalled(app)) {
                    dispatch(downloadAppIcon(app));
                }
            });
        }

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

export const installLocalApp =
    (appPackagePath: string) => async (dispatch: AppDispatch) => {
        const installResult = await installLocalAppInMain(appPackagePath);
        if (installResult.type === 'success') {
            dispatch(addLocalApp(installResult.app));
        } else if (installResult.errorType === 'error reading file') {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Error while installing local app:\n\n${installResult.errorMessage}`
                )
            );
            if (installResult.error != null) {
                console.warn(describeError(installResult.error));
            }
        } else if (installResult.errorType === 'error because app exists') {
            dispatch(
                ErrorDialogActions.showDialog(
                    `A local app \`${installResult.appName}\` already exists. ` +
                        `Overwrite it with the content of \`${appPackagePath}\`?`,
                    {
                        Overwrite: async () => {
                            dispatch(ErrorDialogActions.hideDialog());
                            await removeLocalAppInMain(installResult.appName);
                            dispatch(removeLocalApp(installResult.appName));
                            dispatch(installLocalApp(appPackagePath));
                        },
                        Cancel: () => {
                            dispatch(ErrorDialogActions.hideDialog());
                        },
                    }
                )
            );
        }
    };

export const installDownloadableApp =
    (app: DownloadableAppInfo) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.INSTALL_APP, app.source, app.name);
        dispatch(installDownloadableAppStarted(app));

        installDownloadableAppInMain(app, 'latest')
            .then(installedApp => {
                dispatch(updateDownloadableAppInfo(installedApp));
            })
            .catch(error => {
                dispatch(resetAppProgress(app));
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to install: ${error.message}`
                    )
                );
            });
    };

export const removeDownloadableApp =
    (app: AppSpec) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.REMOVE_APP, app.source, app.name);
        dispatch(removeDownloadableAppStarted(app));
        removeDownloadableAppInMain(app)
            .then(() => {
                dispatch(removeDownloadableAppSuccess(app));
            })
            .catch(error => {
                dispatch(resetAppProgress(app));
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to remove: ${error.message}`
                    )
                );
            });
    };

export const updateDownloadableApp =
    (app: DownloadableAppInfo, version: string) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.UPDATE_APP, app.source, app.name);
        dispatch(updateDownloadableAppStarted(app));

        return installDownloadableAppInMain(app, version)
            .then(installedApp => {
                dispatch(updateDownloadableAppInfo(installedApp));
            })
            .catch(error => {
                dispatch(resetAppProgress(app));
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to update: ${error.message}`
                    )
                );
            });
    };

export const launch = (app: LaunchableApp) => {
    const sharedData =
        `App version: ${app.currentVersion};` +
        ` Engine version: ${app.engineVersion};`;
    sendAppUsageData(EventAction.LAUNCH_APP, sharedData, app.name);
    openApp(app);
};

export const checkEngineAndLaunch =
    (app: LaunchableApp) => (dispatch: AppDispatch) => {
        const compatibilityWarning = appCompatibilityWarning(app);
        const launchAppWithoutWarning =
            compatibilityWarning == null ||
            mainConfig().isRunningLauncherFromSource;

        if (launchAppWithoutWarning) {
            launch(app);
        } else {
            dispatch(
                showConfirmLaunchDialog({
                    app,
                    text: compatibilityWarning.longWarning,
                })
            );
        }
    };
