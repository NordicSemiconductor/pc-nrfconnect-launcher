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
import type { AppDispatch } from '../../store';
import { addDownloadableApps, removeAppsOfSource } from '../apps/appsSlice';
import { hideSource, showSource } from '../filter/filterSlice';
import {
    addSource as addSourceAction,
    removeSource as removeSourceAction,
} from './sourcesSlice';

export const addSource = (url: SourceUrl) => (dispatch: AppDispatch) => {
    addSourceInMain(url)
        .then(({ source, apps }) => {
            dispatch(addSourceAction(source));
            dispatch(showSource(source.name));
            dispatch(addDownloadableApps(apps));
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

export const removeSource = (name: SourceName) => (dispatch: AppDispatch) => {
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
    (source: Source, reason?: string) => (dispatch: AppDispatch) => {
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
    (sources: SourceWithError[]) => (dispatch: AppDispatch) => {
        sources.forEach(({ source, reason }) => {
            if (source.name === OFFICIAL) {
                dispatch(showProblemWithOfficialSource(source, reason));
            } else {
                dispatch(showProblemWithExtraSource(source, reason));
            }
        });
    };
