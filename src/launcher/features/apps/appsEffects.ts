/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow, require as remoteRequire } from '@electron/remote';
import {
    describeError,
    ErrorDialogActions,
    openWindow,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    AppSpec,
    AppWithError,
    DownloadableApp,
    inMain as appsInMain,
    LaunchableApp,
} from '../../../ipc/apps';
import type { AppThunk } from '../../store';
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
    (apps: AppWithError[]): AppThunk =>
    dispatch => {
        if (apps.length === 0) {
            return;
        }

        apps.forEach(app => {
            sendLauncherUsageData(EventAction.REPORT_INSTALLATION_ERROR, {
                ...app,
            });
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

export const downloadLatestAppInfos = (): AppThunk => async dispatch => {
    try {
        dispatch(updateDownloadableAppInfosStarted());
        const { apps, appsWithErrors, sourcesWithErrors } =
            await appsInMain.downloadLatestAppInfos();

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
    (appPackagePath: string): AppThunk =>
    async dispatch => {
        const installResult = await appsInMain.installLocalApp(appPackagePath);
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
                            await appsInMain.removeLocalApp(
                                installResult.appName
                            );
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
    (app: DownloadableApp, version?: string): AppThunk =>
    async dispatch => {
        try {
            const installedApp = await appsInMain.installDownloadableApp(
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
    (app: DownloadableApp, toVersion?: string): AppThunk =>
    dispatch => {
        sendAppUsageData(EventAction.APP_MANAGEMENT, {
            action:
                toVersion !== app.latestVersion
                    ? 'Install Explicit Version'
                    : 'Install',
            appInfo: {
                name: app.name,
                source: app.source,
            },
            toVersion: toVersion ?? app.latestVersion,
        });

        dispatch(installDownloadableAppStarted(app));
        return dispatch(install(app, toVersion));
    };

export const updateDownloadableApp =
    (app: DownloadableApp): AppThunk =>
    dispatch => {
        sendAppUsageData(EventAction.APP_MANAGEMENT, {
            action: 'Update',
            appInfo: {
                name: app.name,
                source: app.source,
            },
            toVersion: app.latestVersion,
        });

        dispatch(updateDownloadableAppStarted(app));
        return dispatch(install(app));
    };

export const removeDownloadableApp =
    (app: AppSpec, currentVersion: string): AppThunk =>
    async dispatch => {
        sendAppUsageData(EventAction.APP_MANAGEMENT, {
            action: 'Remove',
            appInfo: {
                name: app.name,
                source: app.source,
            },
            fromVersion: currentVersion,
        });

        dispatch(removeDownloadableAppStarted(app));
        try {
            await appsInMain.removeDownloadableApp(app);
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
    sendAppUsageData(EventAction.LAUNCH_APP, {
        appInfo: {
            name: app.name,
            source: app.source,
            version: app.currentVersion,
        },
    });
    openWindow.openApp(app);
};

export const checkEngineAndLaunch =
    (app: LaunchableApp): AppThunk =>
    dispatch => {
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
