/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { describeError, ErrorDialogActions } from 'pc-nrfconnect-shared';

import { getDownloadableApps, getLocalApps } from '../../../ipc/apps';
import { getSettings, Settings } from '../../../ipc/settings';
import { getSources } from '../../../ipc/sources';
import type { AppDispatch } from '../../store';
import mainConfig from '../../util/mainConfig';
import {
    downloadLatestAppInfos,
    handleAppsWithErrors,
} from '../apps/appsEffects';
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
    sendEnvInfo,
} from '../usageData/usageDataEffects';

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
