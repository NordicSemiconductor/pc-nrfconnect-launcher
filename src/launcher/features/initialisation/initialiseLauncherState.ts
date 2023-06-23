/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { describeError, ErrorDialogActions } from 'pc-nrfconnect-shared';

import { getDownloadableApps, getLocalApps } from '../../../ipc/apps';
import { getSources } from '../../../ipc/sources';
import type { AppThunk } from '../../store';
import mainConfig from '../../util/mainConfig';
import {
    downloadLatestAppInfos,
    handleAppsWithErrors,
} from '../apps/appsEffects';
import { addDownloadableApps, setAllLocalApps } from '../apps/appsSlice';
import { checkForLauncherUpdate } from '../launcherUpdate/launcherUpdateEffects';
import { getShouldCheckForUpdatesAtStartup } from '../settings/settingsSlice';
import { handleSourcesWithErrors } from '../sources/sourcesEffects';
import { setSources } from '../sources/sourcesSlice';
import {
    checkUsageDataSetting,
    sendEnvInfo,
} from '../usageData/usageDataEffects';

const loadSources = (): AppThunk => async dispatch => {
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

export const loadApps = (): AppThunk => async dispatch => {
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

const downloadLatestAppInfoAtStartup = (): AppThunk => (dispatch, getState) => {
    const shouldCheckForUpdatesAtStartup = getShouldCheckForUpdatesAtStartup(
        getState()
    );

    if (shouldCheckForUpdatesAtStartup && !mainConfig().isSkipUpdateApps) {
        dispatch(downloadLatestAppInfos());
    }
};

const checkForLauncherUpdateAtStartup =
    (): AppThunk => async (dispatch, getState) => {
        const shouldCheckForUpdatesAtStartup =
            getShouldCheckForUpdatesAtStartup(getState());

        if (
            shouldCheckForUpdatesAtStartup &&
            !mainConfig().isSkipUpdateLauncher &&
            process.env.NODE_ENV !== 'development'
        ) {
            await dispatch(checkForLauncherUpdate());
        }
    };

export default (): AppThunk => async dispatch => {
    dispatch(checkUsageDataSetting());

    await dispatch(loadSources());
    await dispatch(loadApps());

    dispatch(downloadLatestAppInfoAtStartup());
    dispatch(checkForLauncherUpdateAtStartup());

    sendEnvInfo();
};
