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
import { getDoNotRemindOnMissingToken } from '../../../common/persistedStore';
import { isDeprecatedSource } from '../../../common/sources';
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
import { handleSourcesWithErrors } from '../sources/sourcesEffects';
import {
    getDoNotRemindDeprecatedSources,
    getSources,
    getSourcesWithRestrictedAccessLevel,
    setSources,
    showDeprecatedSources,
    warnAboutMissingTokenOnStartup,
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
        const informationResult = await artifactoryToken.getTokenInformation();

        if (informationResult.type === 'Success')
            dispatch(
                setArtifactoryTokenInformation(informationResult.information)
            );

        if (informationResult.type === 'Encryption not available') {
            dispatch(
                ErrorDialogActions.showDialog(
                    'nRF Connect for Desktop needs permission to access your Keychain. ' +
                        "Without this permission, restricted sources won't be updated, " +
                        'and attempts to install apps from them will fail.' +
                        '\n\n' +
                        'To change this, you need to restart nRF Connect for Desktop ' +
                        'and on start allow access to your Keychain.'
                )
            );
        }
    } catch (error) {
        dispatch(
            ErrorDialogActions.showDialog(
                `Your identity token could not be validated. If you are online, it may have expired.`,
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

const checkForMissingToken =
    (): AppThunk<undefined | typeof INTERRUPT_INITIALISATION> =>
    (dispatch, getState) => {
        if (getDoNotRemindOnMissingToken()) return;

        const token = getArtifactoryTokenInformation(getState());
        const sourcesWithRestrictedAccessLevel =
            getSourcesWithRestrictedAccessLevel(getState());

        if (token == null && sourcesWithRestrictedAccessLevel.length > 0) {
            dispatch(
                warnAboutMissingTokenOnStartup(sourcesWithRestrictedAccessLevel)
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
    checkForMissingToken,
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
