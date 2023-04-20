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
import {
    EventAction,
    sendAppUsageData,
    sendLauncherUsageData,
} from '../usageData/usageDataEffects';
import { showConfirmLaunchDialog } from './appDialogsSlice';
import {
    addDownloadableApps,
    addLocalApp,
    installDownloadableAppStarted,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    removeLocalApp,
    resetAppProgress,
    updateDownloadableAppInfosFailed,
    updateDownloadableAppInfosStarted,
    updateDownloadableAppInfosSuccess,
    updateDownloadableAppStarted,
} from './appsSlice';

const fs = remoteRequire('fs-extra');

const buildErrorMessage = (apps: AppWithError[]) => {
    const errors = apps.map(app => `* \`${app.reason}\`\n\n`).join('');
    const paths = apps.map(app => `* *${app.path}*\n\n`).join('');
    return (
        'Unable to load all apps, these are the error messages:\n\n' +
        `${errors}Clicking **Recover** will attempt to remove the ` +
        `following broken installation directories:\n\n${paths}`
    );
};

export const handleAppsWithErrors =
    (apps: AppWithError[]) => (dispatch: AppDispatch) => {
        if (apps.length === 0) {
            return;
        }

        apps.forEach(app => {
            sendLauncherUsageData(
                EventAction.REPORT_INSTALLATION_ERROR,
                `${app.source} - ${app.name}`
            );
        });

        const recover = (invalidPaths: string[]) => () => {
            // FIXME later: Do this whole thing in the main process
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

export const downloadLatestAppInfos = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(updateDownloadableAppInfosStarted());
        const { apps, appsWithErrors, sourcesWithErrors } =
            await downloadLatestAppInfosInMain();

        dispatch(addDownloadableApps(apps));
        dispatch(updateDownloadableAppInfosSuccess());
        dispatch(handleAppsWithErrors(appsWithErrors));
        dispatch(handleSourcesWithErrors(sourcesWithErrors));
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

const install =
    (app: DownloadableApp, version?: string) =>
    async (dispatch: AppDispatch) => {
        try {
            const installedApp = await installDownloadableAppInMain(
                app,
                version
            );
            dispatch(addDownloadableApps([installedApp]));
        } catch (error) {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Unable to install: ${(error as Error).message}`
                )
            );
        }
        dispatch(resetAppProgress(app));
    };

export const installDownloadableApp =
    (app: DownloadableApp, version?: string) => (dispatch: AppDispatch) => {
        if (version == null) {
            sendAppUsageData(EventAction.INSTALL_APP, app.source, app.name);
        } else {
            sendAppUsageData(
                EventAction.INSTALL_APP_OLD_VERSION,
                app.source,
                `${app.name} (${version})`
            );
        }

        dispatch(installDownloadableAppStarted(app));
        return dispatch(install(app, version));
    };

export const updateDownloadableApp =
    (app: DownloadableApp) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.UPDATE_APP, app.source, app.name);

        dispatch(updateDownloadableAppStarted(app));
        return dispatch(install(app));
    };

export const removeDownloadableApp =
    (app: AppSpec) => async (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.REMOVE_APP, app.source, app.name);

        dispatch(removeDownloadableAppStarted(app));
        try {
            await removeDownloadableAppInMain(app);
            dispatch(removeDownloadableAppSuccess(app));
        } catch (error) {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Unable to remove: ${(error as Error).message}`
                )
            );
        }
        dispatch(resetAppProgress(app));
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
