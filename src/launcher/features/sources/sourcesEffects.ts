/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ErrorDialogActions } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { AnyAction } from 'redux';

import cleanIpcErrorMessage from '../../../common/cleanIpcErrorMessage';
import { SourceWithError } from '../../../ipc/apps';
import {
    AddSourceError,
    inMain as sources,
    OFFICIAL,
    Source,
    SourceName,
    SourceUrl,
} from '../../../ipc/sources';
import type { AppThunk } from '../../store';
import { addDownloadableApps, removeAppsOfSource } from '../apps/appsSlice';
import { hideSource, showSource } from '../filter/filterSlice';
import { getIsErrorVisible as getIsProxyErrorShown } from '../proxyLogin/proxyLoginSlice';
import { getArtifactoryTokenInformation } from '../settings/settingsSlice';
import {
    addSource as addSourceAction,
    removeSource as removeSourceAction,
    warnAboutMissingTokenOnAddSource,
} from './sourcesSlice';

const showError = (url: string, addSourceError: AddSourceError): AnyAction => {
    switch (addSourceError.errorType) {
        case 'Official sources cannot be added':
            return ErrorDialogActions.showDialog(
                `The url \`${url}\` points to the official source and that cannot be added again.`
            );
        case 'Source already exists':
            return ErrorDialogActions.showDialog(
                `No source added because there already is one with the name “${addSourceError.existingSource.name}”.`
            );

        case 'Unable to retrieve source.json':
            return ErrorDialogActions.showDialog(
                `Unable to retrieve a valid \`source.json\` under the URL \`${url}\`. No source was added.`,
                undefined,
                cleanIpcErrorMessage(addSourceError.message)
            );
    }
};

export const hasRestrictedAccessLevel = (url: SourceUrl) =>
    url.match(
        /https?:\/\/files\.nordicsemi\.com\/ui\/api\/v1\/download\?isNativeBrowsing=false&repoKey=swtools&path=(internal|external-confidential)/
    ) != null;

export const addSource =
    (url: SourceUrl): AppThunk =>
    (dispatch, getState) => {
        const noToken = getArtifactoryTokenInformation(getState()) == null;

        if (hasRestrictedAccessLevel(url) && noToken) {
            dispatch(warnAboutMissingTokenOnAddSource(url));
            return;
        }

        sources
            .addSource(url)
            .then(result => {
                if (result.type === 'success') {
                    dispatch(addSourceAction(result.source));
                    dispatch(showSource(result.source.name));
                    dispatch(addDownloadableApps(result.apps));
                } else {
                    dispatch(showError(url, result));
                }
            })
            .catch(error =>
                dispatch(
                    ErrorDialogActions.showDialog(
                        'Unknown error. No source was added.',
                        undefined,
                        cleanIpcErrorMessage(error.message)
                    )
                )
            );
    };

export const removeSource =
    (name: SourceName): AppThunk =>
    dispatch =>
        sources
            .removeSource(name)
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
    (sourcesWithError: SourceWithError[]): AppThunk =>
    (dispatch, getState) => {
        if (getIsProxyErrorShown(getState())) {
            return;
        }
        sourcesWithError.forEach(({ source, reason }) => {
            if (source.name === OFFICIAL) {
                dispatch(showProblemWithOfficialSource(source, reason));
            } else {
                dispatch(showProblemWithExtraSource(source, reason));
            }
        });
    };
