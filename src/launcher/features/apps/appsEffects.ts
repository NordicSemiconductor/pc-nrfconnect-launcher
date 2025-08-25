/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow, require as remoteRequire } from '@electron/remote';
import {
    describeError,
    ErrorDialogActions,
    getUserDataDir,
    launcherConfig,
    openWindow,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    getJlinkCompatibility,
    NrfutilSandbox,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';

import cleanIpcErrorMessage from '../../../common/cleanIpcErrorMessage';
import {
    AppSpec,
    AppWithError,
    DownloadableApp,
    inMain as appsInMain,
    isInstalled,
    LaunchableApp,
    LocalApp,
} from '../../../ipc/apps';
import type { AppThunk } from '../../store';
import appCompatibilityWarning from '../../util/appCompatibilityWarning';
import { quickStartInfoWasShown } from '../settings/settingsSlice';
import { handleSourcesWithErrors } from '../sources/sourcesEffects';
import { EventAction } from '../telemetry/telemetryEffects';
import { showConfirmLaunchDialog } from './appDialogsSlice';
import {
    addDownloadableApps,
    addLocalApp,
    installDownloadableAppStarted,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    removeLocalApp,
    resetAppInstallProgress,
    setAllLocalApps,
    updateDownloadableAppInfosFailed,
    updateDownloadableAppInfosStarted,
    updateDownloadableAppInfosSuccess,
    updateDownloadableAppStarted,
} from './appsSlice';

const fs = remoteRequire('fs');

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
            telemetry.sendEvent(EventAction.REPORT_INSTALLATION_ERROR, {
                ...app,
            });
        });

        const recover = (invalidPaths: string[]) => () => {
            // FIXME later: Do this whole thing in the main process
            invalidPaths.forEach(p =>
                fs.rmSync(p, { recursive: true, force: true })
            );
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
                    `Unable to install downloadable app.`,
                    undefined,
                    cleanIpcErrorMessage(describeError(error))
                )
            );
        }
        dispatch(resetAppInstallProgress(app));
    };

export const installDownloadableApp =
    (app: DownloadableApp, toVersion?: string): AppThunk =>
    dispatch => {
        telemetry.sendEvent(EventAction.APP_MANAGEMENT, {
            action: toVersion == null ? 'Install' : 'Install Explicit Version',
            appInfo: {
                name: app.name,
                source: app.source,
            },
            toVersion: toVersion ?? app.latestVersion,
            fromVersion: isInstalled(app) ? app.currentVersion : undefined,
        });

        dispatch(installDownloadableAppStarted(app));
        dispatch(install(app, toVersion));
        dispatch(updateJLinkCompatibilityForAllApps(app));
    };

export const updateDownloadableApp =
    (app: DownloadableApp): AppThunk =>
    dispatch => {
        telemetry.sendEvent(EventAction.APP_MANAGEMENT, {
            action: 'Update',
            appInfo: {
                name: app.name,
                source: app.source,
            },
            toVersion: app.latestVersion,
            fromVersion: isInstalled(app) ? app.currentVersion : undefined,
        });

        dispatch(updateDownloadableAppStarted(app));
        return dispatch(install(app));
    };

export const removeDownloadableApp =
    (app: AppSpec, currentVersion: string): AppThunk =>
    async dispatch => {
        telemetry.sendEvent(EventAction.APP_MANAGEMENT, {
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
        dispatch(resetAppInstallProgress(app));
    };

export const launch =
    (app: LaunchableApp, setQuickStartInfoWasShown: boolean): AppThunk =>
    dispatch => {
        if (setQuickStartInfoWasShown) dispatch(quickStartInfoWasShown());

        telemetry.sendEvent(EventAction.LAUNCH_APP, {
            appInfo: {
                name: app.name,
                source: app.source,
                version: app.currentVersion,
            },
        });
        openWindow.openApp(app);
    };

export const checkCompatibilityThenLaunch =
    (app: LaunchableApp, setQuickStartInfoWasShown = false): AppThunk =>
    dispatch => {
        appCompatibilityWarning(app, undefined).then(compatibilityWarning => {
            const launchAppWithoutWarning =
                compatibilityWarning == null ||
                launcherConfig().isRunningLauncherFromSource;

            if (launchAppWithoutWarning) {
                dispatch(launch(app, setQuickStartInfoWasShown));
            } else {
                dispatch(
                    showConfirmLaunchDialog({
                        app,
                        title: compatibilityWarning.title,
                        text: compatibilityWarning.longWarning,
                        warningData: compatibilityWarning.warningData,
                        setQuickStartInfoWasShown,
                    })
                );
            }
        });
    };

const checkJLinkRequirements = async <T extends LocalApp | DownloadableApp>(
    app: T
): Promise<T> => {
    if (!isInstalled(app)) {
        return app;
    }

    const deviceVersion = app.nrfutil?.device?.at(0);
    const coreVersion = app.nrfutilCore;

    if (!deviceVersion) {
        return app;
    }

    const userDir = getUserDataDir();
    const sandbox = await NrfutilSandbox.create(
        userDir,
        'device',
        deviceVersion,
        coreVersion
    );
    const moduleVersion = await sandbox.getModuleVersion();
    const jlinkCompatibility = getJlinkCompatibility(moduleVersion);

    let jlinkMessage: string | undefined;

    if (jlinkCompatibility.kind === 'No J-Link installed') {
        jlinkMessage = `Required SEGGER J-Link not found: expected version V${jlinkCompatibility.requiredJlink}`;
    } else if (jlinkCompatibility.kind === 'Outdated J-Link') {
        jlinkMessage = `Untested version V${jlinkCompatibility.actualJlink} of SEGGER J-Link found: expected at least version V${jlinkCompatibility.requiredJlink}`;
    }

    return {
        ...app,
        jlinkMessage,
    };
};

const getAppsWithJlinkCompatibility = <T extends LocalApp | DownloadableApp>(
    apps: T[],
    exclusiveApp?: LocalApp | DownloadableApp
): Promise<T[]> =>
    Promise.all(
        apps.map(app =>
            exclusiveApp && app.name === exclusiveApp.name
                ? app
                : checkJLinkRequirements(app)
        )
    );

export const updateJLinkCompatibilityForAllApps =
    (exclusiveApp?: LocalApp | DownloadableApp): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        try {
            dispatch(
                setAllLocalApps(
                    await getAppsWithJlinkCompatibility(
                        getState().apps.localApps,
                        exclusiveApp
                    )
                )
            );

            dispatch(
                addDownloadableApps(
                    await getAppsWithJlinkCompatibility(
                        getState().apps.downloadableApps
                    )
                )
            );
        } catch (error) {
            dispatch(ErrorDialogActions.showDialog(describeError(error)));
        }
    };
