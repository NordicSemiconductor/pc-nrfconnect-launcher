/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow, require as remoteRequire } from '@electron/remote';
import { describeError, ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    AppWithError,
    getDownloadableApps,
    getLocalApps,
} from '../../../ipc/apps';
import { getSettings, Settings } from '../../../ipc/settings';
import { getSources } from '../../../ipc/sources';
import type { AppDispatch } from '../../store';
import mainConfig from '../../util/mainConfig';
import { downloadLatestAppInfos } from '../apps/appsEffects';
import { addDownloadableApps, setAllLocalApps } from '../apps/appsSlice';
import {
    setAllShownSources,
    setNameFilter,
    setShownStates,
} from '../filter/filterSlice';
import { checkForCoreUpdates } from '../launcherUpdate/launcherUpdateEffects';
import { setCheckUpdatesAtStartup } from '../settings/settingsSlice';
import { handleSourcesWithErrors } from '../sources/sourcesEffects';
import { setSources } from '../sources/sourcesSlice';
import {
    checkUsageDataSetting,
    EventAction,
    sendEnvInfo,
    sendLauncherUsageData,
} from '../usageData/usageDataEffects';

const fs = remoteRequire('fs-extra');

const initializeFilters = (settings: Settings) => (dispatch: AppDispatch) => {
    dispatch(setShownStates(settings.appFilter.shownStates));
    dispatch(setNameFilter(settings.appFilter.nameFilter));
    dispatch(setAllShownSources(settings.appFilter.shownSources));
};

const loadSources = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(setSources(await getSources()));
    } catch (error) {
        dispatch(
            ErrorDialogActions.showDialog(
                `Unable to load settings: ${describeError(error)}`
            )
        );
    }
};

const handleAppsWithErrors =
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

const buildErrorMessage = (apps: AppWithError[]) => {
    const errors = apps.map(app => `* \`${app.reason}\`\n\n`).join('');
    const paths = apps.map(app => `* *${app.path}*\n\n`).join('');
    return `Unable to load all apps, these are the error messages:\n\n${errors}Clicking **Recover** will attempt to remove the following broken installation directories:\n\n${paths}`;
};

export const loadApps = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(setAllLocalApps(await getLocalApps()));

        const { apps, appsWithErrors, sourcesWithErrors } =
            await getDownloadableApps();

        dispatch(addDownloadableApps(apps));
        dispatch(handleAppsWithErrors(appsWithErrors));
        dispatch(handleSourcesWithErrors(sourcesWithErrors));
    } catch (error) {
        dispatch(ErrorDialogActions.showDialog(describeError(error)));
    }
};

const downloadLatestAppInfoAtStartup =
    (shouldCheckForUpdatesAtStartup: boolean) => (dispatch: AppDispatch) => {
        if (shouldCheckForUpdatesAtStartup && !mainConfig().isSkipUpdateApps) {
            dispatch(downloadLatestAppInfos());
        }
    };

const checkForCoreUpdatesAtStartup =
    (shouldCheckForUpdatesAtStartup: boolean) =>
    async (dispatch: AppDispatch) => {
        if (
            shouldCheckForUpdatesAtStartup &&
            !mainConfig().isSkipUpdateCore &&
            process.env.NODE_ENV !== 'development'
        ) {
            await dispatch(checkForCoreUpdates());
        }
    };

export default () => async (dispatch: AppDispatch) => {
    dispatch(checkUsageDataSetting());

    const settings = await getSettings();
    const { shouldCheckForUpdatesAtStartup } = settings;
    dispatch(setCheckUpdatesAtStartup(shouldCheckForUpdatesAtStartup));
    dispatch(initializeFilters(settings));

    await dispatch(loadSources());
    await dispatch(loadApps());

    dispatch(downloadLatestAppInfoAtStartup(shouldCheckForUpdatesAtStartup));
    dispatch(checkForCoreUpdatesAtStartup(shouldCheckForUpdatesAtStartup));

    sendEnvInfo();
};
