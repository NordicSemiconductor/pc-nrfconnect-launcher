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

import cleanIpcErrorMessage from '../../../common/cleanIpcErrorMessage';
import { isDeprecatedSource } from '../../../common/legacySource';
import {
    setWarnedOnMissingTokenAndMigratedSources,
    wasWarnedOnMissingTokenAndMigratedSources,
} from '../../../common/persistedStore';
import { inMain } from '../../../ipc/apps';
import { inMain as artifactoryToken } from '../../../ipc/artifactoryToken';
import { inMain as sources } from '../../../ipc/sources';
import type { AppThunk } from '../../store';
import {
    downloadLatestAppInfos,
    handleAppsWithErrors,
} from '../apps/appsEffects';
import { addDownloadableApps, setAllLocalApps } from '../apps/appsSlice';
import { checkForLauncherUpdate } from '../launcherUpdate/launcherUpdateEffects';
import {
    getArtifactoryTokenInformation,
    getShouldCheckForUpdatesAtStartup,
    setArtifactoryTokenInformation,
} from '../settings/settingsSlice';
import {
    handleSourcesWithErrors,
    hasRestrictedAccessLevel,
} from '../sources/sourcesEffects';
import {
    getDoNotRemindDeprecatedSources,
    getSources,
    setSources,
    showDeprecatedSources,
    warnAboutMissingTokenOnMigratingSources,
} from '../sources/sourcesSlice';
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

const checkForDeprecatedSources =
    (): AppThunk<undefined | typeof INTERRUPT_INITIALISATION> =>
    (dispatch, getState) => {
        const deprecatedSources = getSources(getState()).filter(
            isDeprecatedSource
        );

        if (
            !(
                deprecatedSources.length === 0 ||
                getDoNotRemindDeprecatedSources(getState())
            )
        ) {
            dispatch(showDeprecatedSources(deprecatedSources));
            return INTERRUPT_INITIALISATION;
        }
    };

const checkForMissingTokenAndMigratedSources =
    (): AppThunk<undefined | typeof INTERRUPT_INITIALISATION> =>
    (dispatch, getState) => {
        if (wasWarnedOnMissingTokenAndMigratedSources()) return;
        setWarnedOnMissingTokenAndMigratedSources();

        const token = getArtifactoryTokenInformation(getState());
        const sourcesWithRestrictedAccessLevel = getSources(getState()).filter(
            source => hasRestrictedAccessLevel(source.url)
        );

        if (token == null && sourcesWithRestrictedAccessLevel.length > 0) {
            dispatch(
                warnAboutMissingTokenOnMigratingSources(
                    sourcesWithRestrictedAccessLevel
                )
            );
            return INTERRUPT_INITIALISATION;
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

const INTERRUPT_INITIALISATION = Symbol('interrupt initialisation');

const initialisationActions = [
    checkTelemetrySetting,
    loadSources,
    loadApps,
    loadTokenInformation,
    checkForDeprecatedSources,
    checkForMissingTokenAndMigratedSources,
    downloadLatestAppInfoAtStartup,
    checkForLauncherUpdateAtStartup,
    sendEnvInfo,
];

const runRemainingInitialisationActionsSequentially =
    (): AppThunk => async dispatch => {
        while (initialisationActions.length > 0) {
            const action = initialisationActions.shift() as () => AppThunk<
                undefined | typeof INTERRUPT_INITIALISATION
            >;

            const result = await dispatch(action()); // eslint-disable-line no-await-in-loop -- Must be awaited because some actions are asynchronous

            if (result === INTERRUPT_INITIALISATION) {
                return;
            }
        }
    };

export default (): AppThunk => dispatch => {
    dispatch(runRemainingInitialisationActionsSequentially());
};
