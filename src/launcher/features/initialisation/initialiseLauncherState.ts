/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    describeError,
    ErrorDialogActions,
    launcherConfig,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { inMain } from '../../../ipc/apps';
import { inMain as artifactoryToken } from '../../../ipc/artifactoryToken';
import { cleanIpcErrorMessage } from '../../../ipc/error';
import { inMain as sources } from '../../../ipc/sources';
import type { AppThunk } from '../../store';
import {
    downloadLatestAppInfos,
    handleAppsWithErrors,
} from '../apps/appsEffects';
import { addDownloadableApps, setAllLocalApps } from '../apps/appsSlice';
import { checkForLauncherUpdate } from '../launcherUpdate/launcherUpdateEffects';
import {
    getShouldCheckForUpdatesAtStartup,
    setArtifactoryTokenInformation,
} from '../settings/settingsSlice';
import { handleSourcesWithErrors } from '../sources/sourcesEffects';
import { setSources } from '../sources/sourcesSlice';
import {
    checkTelemetrySetting,
    sendEnvInfo,
} from '../telemetry/telemetryEffects';

const loadSources = (): AppThunk => async dispatch => {
    try {
        dispatch(setSources(await sources.getSources()));
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
        dispatch(setAllLocalApps(await inMain.getLocalApps()));

        const { apps, appsWithErrors, sourcesWithErrors } =
            await inMain.getDownloadableApps();

        dispatch(addDownloadableApps(apps));
        dispatch(handleAppsWithErrors(appsWithErrors));
        dispatch(handleSourcesWithErrors(sourcesWithErrors));
    } catch (error) {
        dispatch(ErrorDialogActions.showDialog(describeError(error)));
    }
};

const loadTokenInformation = (): AppThunk => async (dispatch, getState) => {
    const shouldCheckForUpdatesAtStartup = getShouldCheckForUpdatesAtStartup(
        getState()
    );
    if (!shouldCheckForUpdatesAtStartup) return;

    try {
        const token = await artifactoryToken.getTokenInformation();
        if (token != null) dispatch(setArtifactoryTokenInformation(token));
    } catch (error) {
        dispatch(
            ErrorDialogActions.showDialog(
                `Your Artifactory token could not be validated. If you are online it may have expired.`,
                undefined,
                cleanIpcErrorMessage(describeError(error))
            )
        );
    }
};

const downloadLatestAppInfoAtStartup = (): AppThunk => (dispatch, getState) => {
    const shouldCheckForUpdatesAtStartup = getShouldCheckForUpdatesAtStartup(
        getState()
    );

    if (shouldCheckForUpdatesAtStartup && !launcherConfig().isSkipUpdateApps) {
        dispatch(downloadLatestAppInfos());
    }
};

const checkForLauncherUpdateAtStartup =
    (): AppThunk => async (dispatch, getState) => {
        const shouldCheckForUpdatesAtStartup =
            getShouldCheckForUpdatesAtStartup(getState());

        if (
            shouldCheckForUpdatesAtStartup &&
            !launcherConfig().isSkipUpdateLauncher &&
            process.env.NODE_ENV !== 'development'
        ) {
            await dispatch(checkForLauncherUpdate());
        }
    };

export default (): AppThunk => async dispatch => {
    dispatch(checkTelemetrySetting());

    await dispatch(loadSources());
    await dispatch(loadApps());

    dispatch(loadTokenInformation());
    dispatch(downloadLatestAppInfoAtStartup());
    dispatch(checkForLauncherUpdateAtStartup());

    sendEnvInfo();
};
