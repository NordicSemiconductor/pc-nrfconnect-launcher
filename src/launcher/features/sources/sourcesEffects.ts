/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { describeError, ErrorDialogActions } from 'pc-nrfconnect-shared';

import { cleanIpcErrorMessage } from '../../../ipc/error';
import {
    addSource as addSourceInMain,
    getSources,
    removeSource as removeSourceInMain,
    SourceName,
    SourceUrl,
} from '../../../ipc/sources';
import type { AppDispatch } from '../..';
import {
    loadDownloadableApps,
    setAppManagementSource,
} from '../../actions/appsActions';
import {
    addSource as addSourceAction,
    removeSource as removeSourceAction,
    setSources,
} from './sourcesSlice';

export const loadSources = async (dispatch: AppDispatch) => {
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

export const addSource = (url: SourceUrl) => (dispatch: AppDispatch) => {
    addSourceInMain(url)
        .then(source => dispatch(addSourceAction({ name: source, url })))
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

export const removeSource = (name: SourceName) => (dispatch: AppDispatch) => {
    removeSourceInMain(name)
        .then(() => dispatch(removeSourceAction(name)))
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