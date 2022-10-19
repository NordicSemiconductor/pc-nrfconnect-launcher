/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow, require as remoteRequire } from '@electron/remote';
import { join } from 'path';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    AppSpec,
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
import { getAppsRootDir } from '../../../main/config';
import type { AppDispatch } from '../..';
import checkAppCompatibility from '../../util/checkAppCompatibility';
import mainConfig from '../../util/mainConfig';
import {
    EventAction,
    sendAppUsageData,
    sendLauncherUsageData,
} from '../usageData/usageDataEffects';
import {
    installDownloadableAppError,
    installDownloadableAppStarted,
    installDownloadableAppSuccess,
    loadDownloadableAppsError,
    loadDownloadableAppsStarted,
    loadDownloadableAppsSuccess,
    loadLocalAppsError,
    loadLocalAppsStarted,
    loadLocalAppsSuccess,
    removeDownloadableAppError,
    removeDownloadableAppStarted,
    removeDownloadableAppSuccess,
    setAppIconPath,
    setAppReleaseNote,
    showConfirmLaunchDialog,
    upgradeDownloadableAppError,
    upgradeDownloadableAppStarted,
    upgradeDownloadableAppSuccess,
} from './appsSlice';

const fs = remoteRequire('fs-extra');

const downloadAppIcon =
    (app: AppSpec, iconUrl: string, iconPath: string) =>
    (dispatch: AppDispatch) => {
        // If there is a cached version, use it even before downloading.
        if (fs.existsSync(iconPath)) {
            dispatch(setAppIconPath({ app, iconPath }));
        }
        downloadToFile(iconUrl, iconPath)
            .then(() => dispatch(setAppIconPath({ app, iconPath })))
            .catch(() => {
                /* Ignore 404 not found. */
            });
    };

export const loadLocalApps = () => (dispatch: AppDispatch) => {
    dispatch(loadLocalAppsStarted());

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
    appToUpdate?: AppSpec
) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const app of apps) {
        if (
            appToUpdate != null &&
            (app.name !== appToUpdate.name || app.source !== appToUpdate.source)
        ) {
            // eslint-disable-next-line no-continue
            continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const releaseNote = await downloadReleaseNotes(app);
        if (releaseNote != null) {
            dispatch(setAppReleaseNote({ app, releaseNote }));
        }
    }
};

export const loadDownloadableApps =
    (appToUpdate?: AppSpec) => async (dispatch: AppDispatch) => {
        dispatch(loadDownloadableAppsStarted());
        const { apps, appsWithErrors } = await getDownloadableApps();

        dispatch(
            loadDownloadableAppsSuccess({
                downloadableApps: apps,
                appToUpdate,
            })
        );
        apps.filter(app => !app.isInstalled).forEach(app => {
            const iconPath = join(
                `${getAppsRootDir(app.source, mainConfig())}`,
                `${app.name}.svg`
            );
            const iconUrl = `${app.url}.svg`;
            dispatch(downloadAppIcon(app, iconUrl, iconPath));
        });

        downloadAllReleaseNotesInBackground(dispatch, apps, appToUpdate);

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
    (app: AppSpec) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.INSTALL_APP, app.source, app.name);
        dispatch(installDownloadableAppStarted(app));

        installDownloadableAppInMain(app, 'latest')
            .then(() => {
                dispatch(installDownloadableAppSuccess(app));
                dispatch(loadDownloadableApps(app));
            })
            .catch(error => {
                dispatch(installDownloadableAppError());
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
                dispatch(removeDownloadableAppError());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to remove: ${error.message}`
                    )
                );
            });
    };

export const upgradeDownloadableApp =
    (app: AppSpec, version: string) => (dispatch: AppDispatch) => {
        sendAppUsageData(EventAction.UPGRADE_APP, app.source, app.name);
        dispatch(upgradeDownloadableAppStarted(app));

        return installDownloadableAppInMain(app, version)
            .then(() => {
                dispatch(upgradeDownloadableAppSuccess(app));
                dispatch(loadDownloadableApps(app));
            })
            .catch(error => {
                dispatch(upgradeDownloadableAppError());
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to upgrade: ${error.message}`
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
        const appCompatibility = checkAppCompatibility(app);
        const launchAppWithoutWarning =
            appCompatibility.isCompatible ||
            mainConfig().isRunningLauncherFromSource;

        if (launchAppWithoutWarning) {
            launch(app);
        } else {
            dispatch(
                showConfirmLaunchDialog({
                    app,
                    text: appCompatibility.longWarning,
                })
            );
        }
    };
