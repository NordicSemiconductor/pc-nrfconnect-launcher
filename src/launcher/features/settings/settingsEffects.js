/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// @ts-check

import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import { cleanIpcErrorMessage } from '../../../ipc/error';
import { getSetting, setSetting } from '../../../ipc/settings';
import {
    addSource as addSourceInMain,
    getSources,
    removeSource as removeSourceInMain,
} from '../../../ipc/sources';
import {
    loadDownloadableApps,
    setAppManagementSource,
} from '../../actions/appsActions';
import {
    addSourceAction,
    checkUpdatesAtStartupChangedAction,
    loadSettingsSuccessAction,
    sourceRemovedAction,
} from '../../actions/settingsActions';

export const loadSettings = async dispatch => {
    try {
        const shouldCheckForUpdatesAtStartup =
            (await getSetting('shouldCheckForUpdatesAtStartup')) ?? true;
        const sources = await getSources();

        dispatch(
            loadSettingsSuccessAction({
                shouldCheckForUpdatesAtStartup,
                sources,
            })
        );
    } catch (error) {
        dispatch(
            ErrorDialogActions.showDialog(
                `Unable to load settings: ${error.message}`
            )
        );
    }
};

export const checkUpdatesAtStartupChanged = isEnabled => dispatch => {
    dispatch(checkUpdatesAtStartupChangedAction(isEnabled));
    setSetting('shouldCheckForUpdatesAtStartup', isEnabled);
};

export const addSource = url => dispatch => {
    addSourceInMain(url)
        .then(source => dispatch(addSourceAction(source, url)))
        .catch(error =>
            dispatch(
                ErrorDialogActions.showDialog(
                    cleanIpcErrorMessage(
                        error.message,
                        'Error while trying to add a source: '
                    )
                )
            )
        )
        .then(() => dispatch(loadDownloadableApps()));
};

export const removeSource = name => dispatch => {
    removeSourceInMain(name)
        .then(() => dispatch(sourceRemovedAction(name)))
        .then(() => dispatch(loadDownloadableApps()))
        .then(async () => dispatch(await setAppManagementSource(name)))
        .catch(error =>
            dispatch(
                ErrorDialogActions.showDialog(
                    cleanIpcErrorMessage(
                        error.message,
                        `Error while trying to remove the source '${name}': `
                    )
                )
            )
        );
};
