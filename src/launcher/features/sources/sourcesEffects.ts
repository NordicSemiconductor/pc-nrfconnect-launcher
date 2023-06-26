/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import { SourceWithError } from '../../../ipc/apps';
import { cleanIpcErrorMessage } from '../../../ipc/error';
import {
    addSource as addSourceInMain,
    OFFICIAL,
    removeSource as removeSourceInMain,
    Source,
    SourceName,
    SourceUrl,
} from '../../../ipc/sources';
import type { AppThunk } from '../../store';
import { addDownloadableApps, removeAppsOfSource } from '../apps/appsSlice';
import { hideSource, showSource } from '../filter/filterSlice';
import { getIsErrorVisible as getIsProxyErrorShown } from '../proxyLogin/proxyLoginSlice';
import {
    addSource as addSourceAction,
    removeSource as removeSourceAction,
} from './sourcesSlice';

export const addSource =
    (url: SourceUrl): AppThunk =>
    dispatch => {
        addSourceInMain(url)
            .then(result => {
                if (result.type === 'success') {
                    dispatch(addSourceAction(result.source));
                    dispatch(showSource(result.source.name));
                    dispatch(addDownloadableApps(result.apps));
                } else {
                    dispatch(
                        ErrorDialogActions.showDialog(
                            'No source added because there already is one ' +
                                `with the name “${result.existingSource.name}”.`
                        )
                    );
                }
            })
            .catch(error =>
                dispatch(
                    ErrorDialogActions.showDialog(
                        cleanIpcErrorMessage(
                            error.message,
                            'Error while trying to add a source: '
                        )
                    )
                )
            );
    };

export const removeSource =
    (name: SourceName): AppThunk =>
    dispatch => {
        removeSourceInMain(name)
            .then(() => {
                dispatch(removeAppsOfSource(name));
                dispatch(removeSourceAction(name));
                dispatch(hideSource(name));
            })
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

const showProblemWithOfficialSource = (source: Source, reason?: string) =>
    ErrorDialogActions.showDialog(
        `Unable to retrieve the official source from ${source.url}.\n\n` +
            'This is usually caused by a missing internet connection. ' +
            'Without retrieving that file, official apps cannot be installed. ',
        undefined,
        reason
    );

const showProblemWithExtraSource =
    (source: Source, reason?: string): AppThunk =>
    dispatch => {
        dispatch(
            ErrorDialogActions.showDialog(
                `Unable to retrieve the source “${source.name}” ` +
                    `from ${source.url}. \n\n` +
                    'This is usually caused by outdated app sources in the settings, ' +
                    'where the sources files was removed from the server.',
                {
                    'Remove source': () => {
                        dispatch(removeSource(source.name));
                        dispatch(ErrorDialogActions.hideDialog());
                    },
                    Cancel: () => {
                        dispatch(ErrorDialogActions.hideDialog());
                    },
                },
                reason
            )
        );
    };

export const handleSourcesWithErrors =
    (sources: SourceWithError[]): AppThunk =>
    (dispatch, getState) => {
        if (getIsProxyErrorShown(getState())) {
            return;
        }
        sources.forEach(({ source, reason }) => {
            if (source.name === OFFICIAL) {
                dispatch(showProblemWithOfficialSource(source, reason));
            } else {
                dispatch(showProblemWithExtraSource(source, reason));
            }
        });
    };
