/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { describeError, ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    AppSpec,
    DownloadableApp,
    downloadLatestAppInfos as downloadLatestAppInfosInMain,
    installDownloadableApp as installDownloadableAppInMain,
    installLocalApp as installLocalAppInMain,
    LaunchableApp,
    removeDownloadableApp as removeDownloadableAppInMain,
    removeLocalApp as removeLocalAppInMain,
} from '../../../ipc/apps';
import { openApp } from '../../../ipc/openWindow';
import type { AppDispatch } from '../../store';
import appCompatibilityWarning from '../../util/appCompatibilityWarning';
import mainConfig from '../../util/mainConfig';
import { handleSourcesWithErrors } from '../sources/sourcesEffects';
import { EventAction, sendAppUsageData } from '../usageData/usageDataEffects';
import {
    addLocalApp,
    installDownloadableAppStarted,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    removeLocalApp,
    resetAppProgress,
    showConfirmLaunchDialog,
    updateDownloadableAppInfo,
    updateDownloadableAppInfos,
    updateDownloadableAppInfosFailed,
    updateDownloadableAppInfosStarted,
    updateDownloadableAppStarted,
} from './appsSlice';

export const downloadLatestAppInfos = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(updateDownloadableAppInfosStarted());
        const latestAppInfos = await downloadLatestAppInfosInMain();
        dispatch(
            updateDownloadableAppInfos({ updatedAppInfos: latestAppInfos.apps })
        );
        handleSourcesWithErrors(latestAppInfos.sourcesFailedToDownload);
    } catch (error) {
        dispatch(updateDownloadableAppInfosFailed());
        dispatch(
            ErrorDialogActions.showDialog(
                `Unable to download latest app info: ${describeError(error)}`
            )
        );
    }
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
    (app: DownloadableApp) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.INSTALL_APP, app.source, app.name);
        dispatch(installDownloadableAppStarted(app));

        installDownloadableAppInMain(app)
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
    (app: DownloadableApp) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.UPDATE_APP, app.source, app.name);
        dispatch(updateDownloadableAppStarted(app));

        return installDownloadableAppInMain(app)
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
